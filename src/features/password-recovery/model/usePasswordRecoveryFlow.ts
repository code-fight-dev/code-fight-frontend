"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { confirmPasswordReset, requestPasswordReset } from "../api/passwordRecovery";
import { getPasswordRecoveryErrorMessage } from "./errors";
import {
  executePasswordResetRecaptcha,
  isPasswordResetRecaptchaEnabled,
} from "./recaptcha";
import type { PasswordChecks, PasswordRecoveryStep } from "./types";

const SIMPLE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_CODE_LENGTH = 6;
const RESET_CODE_RESEND_COOLDOWN_SECONDS = 45;

type CaptchaOperator = "+" | "-";

type CaptchaChallenge = {
  left: number;
  right: number;
  operator: CaptchaOperator;
  answer: number;
};

function createCaptchaChallenge(): CaptchaChallenge {
  const operator: CaptchaOperator = Math.random() > 0.5 ? "+" : "-";

  if (operator === "+") {
    const left = Math.floor(Math.random() * 7) + 2;
    const right = Math.floor(Math.random() * 7) + 2;

    return {
      left,
      right,
      operator,
      answer: left + right,
    };
  }

  const left = Math.floor(Math.random() * 8) + 3;
  const right = Math.floor(Math.random() * (left - 1)) + 1;

  return {
    left,
    right,
    operator,
    answer: left - right,
  };
}

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return email;
  }

  const visibleLocalPart = localPart.slice(0, 2);
  const hiddenLocalPart = "*".repeat(Math.max(localPart.length - 2, 1));

  return `${visibleLocalPart}${hiddenLocalPart}@${domain}`;
}

function toDigitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function buildPasswordChecks(password: string, confirmPassword: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    passwordsMatch: confirmPassword.length > 0 && password === confirmPassword,
  };
}

export function usePasswordRecoveryFlow() {
  const isGoogleRecaptchaEnabled = isPasswordResetRecaptchaEnabled();
  const [step, setStep] = useState<PasswordRecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array.from({ length: RESET_CODE_LENGTH }, () => ""),
  );
  const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge>(() =>
    createCaptchaChallenge(),
  );
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const verificationCode = useMemo(() => codeDigits.join(""), [codeDigits]);

  const passwordChecks = useMemo(
    () => buildPasswordChecks(password, confirmPassword),
    [password, confirmPassword],
  );

  const activeStepIndex =
    step === "success" ? 3 : ["email", "verify", "password"].indexOf(step);
  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setResendCooldown((currentValue) =>
        currentValue > 0 ? currentValue - 1 : currentValue,
      );
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [resendCooldown]);

  const captchaExpression = `${captchaChallenge.left} ${captchaChallenge.operator} ${captchaChallenge.right} = ?`;

  function refreshCaptcha() {
    setCaptchaChallenge(createCaptchaChallenge());
    setCaptchaAnswer("");
  }

  function updateCodeDigit(index: number, value: string) {
    const nextDigit = toDigitsOnly(value).slice(-1);

    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      nextDigits[index] = nextDigit;
      return nextDigits;
    });
  }

  function focusCodeDigitInput(index: number) {
    codeInputRefs.current[index]?.focus();
  }

  function handleCodeDigitChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    setErrorMessage(null);
    updateCodeDigit(index, event.currentTarget.value);

    const nextValue = toDigitsOnly(event.currentTarget.value).slice(-1);
    if (nextValue && index < RESET_CODE_LENGTH - 1) {
      focusCodeDigitInput(index + 1);
    }
  }

  function handleCodeDigitKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Backspace") {
      return;
    }

    if (codeDigits[index]) {
      updateCodeDigit(index, "");
      return;
    }

    if (index <= 0) {
      return;
    }

    updateCodeDigit(index - 1, "");
    focusCodeDigitInput(index - 1);
  }

  function handleCodePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const pastedDigits = toDigitsOnly(event.clipboardData.getData("text/plain")).slice(
      0,
      RESET_CODE_LENGTH,
    );
    if (!pastedDigits) {
      return;
    }

    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      for (let index = 0; index < RESET_CODE_LENGTH; index += 1) {
        nextDigits[index] = pastedDigits[index] ?? "";
      }
      return nextDigits;
    });

    const focusIndex = Math.min(pastedDigits.length, RESET_CODE_LENGTH - 1);
    focusCodeDigitInput(focusIndex);
  }

  async function handleEmailStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const nextEmail = email.trim().toLowerCase();
    const expectedCaptchaAnswer = String(captchaChallenge.answer);

    if (!nextEmail) {
      setErrorMessage("Email is required.");
      return;
    }

    if (!SIMPLE_EMAIL_PATTERN.test(nextEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (!isGoogleRecaptchaEnabled) {
      if (!captchaAnswer.trim()) {
        setErrorMessage("Captcha answer is required.");
        return;
      }

      if (captchaAnswer.trim() !== expectedCaptchaAnswer) {
        setErrorMessage("Captcha answer is incorrect.");
        refreshCaptcha();
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const captchaToken = await executePasswordResetRecaptcha();
      const requestPayload = captchaToken
        ? { email: nextEmail, captchaToken }
        : { email: nextEmail };
      await requestPasswordReset(requestPayload);
      setCodeDigits(Array.from({ length: RESET_CODE_LENGTH }, () => ""));
      setResendCooldown(RESET_CODE_RESEND_COOLDOWN_SECONDS);

      setEmail(nextEmail);
      setCodeDigits(Array.from({ length: RESET_CODE_LENGTH }, () => ""));
      setPassword("");
      setConfirmPassword("");
      setStep("verify");
      setResendCooldown(RESET_CODE_RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setErrorMessage(
        getPasswordRecoveryErrorMessage(error instanceof Error ? error.message : ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleVerifyStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (verificationCode.length !== RESET_CODE_LENGTH) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }

    setStep("password");
  }

  async function handlePasswordStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage("New password is required.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setErrorMessage("Password must be between 8 and 72 characters.");
      return;
    }

    if (!passwordChecks.hasUppercase) {
      setErrorMessage("Password must include at least one uppercase letter.");
      return;
    }

    if (!passwordChecks.hasNumber) {
      setErrorMessage("Password must include at least one number.");
      return;
    }

    if (!passwordChecks.passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await confirmPasswordReset({
        email,
        code: verificationCode,
        password,
      });
      setStep("success");
    } catch (error) {
      setErrorMessage(
        getPasswordRecoveryErrorMessage(error instanceof Error ? error.message : ""),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isResending || !email) {
      return;
    }

    setErrorMessage(null);

    try {
      setIsResending(true);
      const captchaToken = await executePasswordResetRecaptcha();
      const requestPayload = captchaToken ? { email, captchaToken } : { email };
      await requestPasswordReset(requestPayload);
      setCodeDigits(Array.from({ length: RESET_CODE_LENGTH }, () => ""));
      setResendCooldown(RESET_CODE_RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setErrorMessage(
        getPasswordRecoveryErrorMessage(error instanceof Error ? error.message : ""),
      );
    } finally {
      setIsResending(false);
    }
  }

  function handleBackToEmailStep() {
    setErrorMessage(null);
    setStep("email");
    setCodeDigits(Array.from({ length: RESET_CODE_LENGTH }, () => ""));
    refreshCaptcha();
  }

  function handleBackToVerifyStep() {
    setErrorMessage(null);
    setStep("verify");
  }

  return {
    activeStepIndex,
    captchaAnswer,
    captchaExpression,
    codeDigits,
    codeInputRefs,
    confirmPassword,
    email,
    errorMessage,
    handleBackToEmailStep,
    handleBackToVerifyStep,
    handleCodeDigitChange,
    handleCodeDigitKeyDown,
    handleCodePaste,
    handleEmailStepSubmit,
    handlePasswordStepSubmit,
    handleResendCode,
    handleVerifyStepSubmit,
    isResending,
    isGoogleRecaptchaEnabled,
    isSubmitting,
    maskedEmail,
    password,
    passwordChecks,
    refreshCaptcha,
    resendCooldown,
    setCaptchaAnswer,
    setConfirmPassword,
    setEmail,
    setPassword,
    step,
  };
}
