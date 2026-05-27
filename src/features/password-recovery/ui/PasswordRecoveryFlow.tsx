"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { usePasswordRecoveryFlow } from "../model/usePasswordRecoveryFlow";

const RECOVERY_STEPS = [
  {
    id: "email",
    label: "Email",
  },
  {
    id: "verify",
    label: "Code",
  },
  {
    id: "password",
    label: "Password",
  },
] as const;

type StepId = (typeof RECOVERY_STEPS)[number]["id"];

type PasswordRequirementProps = {
  label: string;
  passed: boolean;
};

function PasswordRequirement({ label, passed }: PasswordRequirementProps) {
  return (
    <li className="flex items-center gap-2 text-[13px] tracking-[-0.02em] text-(--app-text-soft)">
      <span
        className={cn(
          "inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border",
          passed
            ? "border-emerald-400/45 bg-emerald-500/14 text-emerald-300"
            : "border-(--app-surface-soft-border) bg-transparent text-transparent",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={2.3} />
      </span>
      {label}
    </li>
  );
}

function getStepTitle(step: StepId | "success") {
  switch (step) {
    case "email":
      return "Forgot password";
    case "verify":
      return "Check your inbox";
    case "password":
      return "Set a new password";
    case "success":
      return "All set";
  }
}

function getStepDescription(step: StepId | "success", maskedEmail: string) {
  switch (step) {
    case "email":
      return "Enter your account email and we'll send a 6-digit reset code.";
    case "verify":
      return `If an account exists for ${maskedEmail}, we just sent a verification code.`;
    case "password":
      return "Choose a strong password to secure your account.";
    case "success":
      return "Your password has been updated. You can sign in now.";
  }
}

function isStepDone(
  activeStepIndex: number,
  currentStep: StepId | "success",
  stepIndex: number,
) {
  if (currentStep === "success") {
    return true;
  }

  return activeStepIndex > stepIndex;
}

export function PasswordRecoveryFlow() {
  const {
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
    isGoogleRecaptchaEnabled,
    isResending,
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
  } = usePasswordRecoveryFlow();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  return (
    <div className="app-shell-card mx-auto w-full max-w-2xl rounded-[30px] px-6 py-8 sm:px-8 sm:py-10">
      <div className="font-accent text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
        Account Recovery
      </div>

      <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[2.4rem]">
        {getStepTitle(step)}
      </h1>

      <p className="mt-2 max-w-155 text-[1rem] leading-[1.68] tracking-[-0.03em] text-(--app-text-soft)">
        {getStepDescription(step, maskedEmail)}
      </p>

      <ol className="mt-8 grid grid-cols-3 gap-2 border-t border-(--app-surface-soft-border) pt-5">
        {RECOVERY_STEPS.map((recoveryStep, index) => {
          const done = isStepDone(activeStepIndex, step, index);
          const active = !done && step !== "success" && activeStepIndex === index;

          return (
            <li key={recoveryStep.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[12px] font-semibold tracking-[-0.02em]",
                  done
                    ? "border-emerald-400/50 bg-emerald-500/14 text-emerald-300"
                    : active
                      ? "border-blue-400/55 bg-blue-500/14 text-blue-300"
                      : "border-(--app-surface-soft-border) bg-transparent text-(--app-text-faint)",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>

              <span
                className={cn(
                  "text-[13px] font-medium tracking-[-0.02em]",
                  active || done ? "text-(--app-text-strong)" : "text-(--app-text-faint)",
                )}
              >
                {recoveryStep.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="app-shell-card-soft mt-6 rounded-3xl px-5 py-6 sm:px-6 sm:py-7">
        {step === "email" ? (
          <form onSubmit={handleEmailStepSubmit} noValidate>
            <div>
              <label
                htmlFor="recovery-email"
                className="mb-3 block text-[13px] font-medium tracking-widest text-(--app-text-faint) uppercase"
              >
                Email
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-(--app-input-icon)">
                  <Mail className="h-4.5 w-4.5" strokeWidth={2} />
                </div>

                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="app-input-surface h-13.5 w-full rounded-2xl pr-4 pl-12 text-[16px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_24px_rgba(3,7,18,0.12)]"
                />
              </div>
            </div>

            {!isGoogleRecaptchaEnabled ? (
              <div className="mt-5">
                <label
                  htmlFor="recovery-captcha"
                  className="mb-3 block text-[13px] font-medium tracking-widest text-(--app-text-faint) uppercase"
                >
                  Captcha - Confirm You&apos;re Human
                </label>

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_44px] gap-2">
                  <div
                    data-testid="captcha-expression"
                    className="flex h-13.5 items-center justify-center rounded-2xl border border-dashed border-(--app-surface-soft-border) bg-(--app-surface-input) px-2 text-[15px] tracking-[-0.02em] text-(--app-text-strong)"
                  >
                    {captchaExpression}
                  </div>

                  <input
                    id="recovery-captcha"
                    name="captcha"
                    value={captchaAnswer}
                    onChange={(event) => setCaptchaAnswer(event.currentTarget.value)}
                    autoComplete="off"
                    inputMode="numeric"
                    placeholder="Answer"
                    disabled={isSubmitting}
                    className="app-input-surface h-13.5 w-full rounded-2xl px-4 text-[16px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_24px_rgba(3,7,18,0.12)]"
                  />

                  <IconButton
                    type="button"
                    aria-label="Refresh captcha"
                    onClick={refreshCaptcha}
                    disabled={isSubmitting}
                    className="h-11 w-11 self-center rounded-2xl border border-(--app-surface-soft-border)"
                  >
                    <RefreshCw className="h-4 w-4" strokeWidth={2} />
                  </IconButton>
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 min-h-13.5 w-full rounded-2xl text-[15px] sm:text-[16px]"
            >
              {isSubmitting ? "Sending code..." : "Send code"}
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.1} />
            </Button>

            <p className="mt-4 text-center text-[13px] tracking-[-0.02em] text-(--app-text-faint)">
              If an account exists for this email, you&apos;ll receive a code shortly.
            </p>
            {isGoogleRecaptchaEnabled ? (
              <p className="mt-2 text-center text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
                Protected by Google reCAPTCHA.
              </p>
            ) : null}
          </form>
        ) : null}

        {step === "verify" ? (
          <form onSubmit={handleVerifyStepSubmit} noValidate>
            <p className="text-[14px] tracking-[-0.02em] text-(--app-text-soft)">
              Code sent to{" "}
              <span className="font-medium text-(--app-text-strong)">{maskedEmail}</span>
            </p>

            <div className="mt-5">
              <label className="mb-3 block text-[13px] font-medium tracking-widest text-(--app-text-faint) uppercase">
                Verification Code
              </label>

              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {codeDigits.map((digit, index) => (
                  <input
                    key={`recovery-code-${index + 1}`}
                    ref={(node) => {
                      codeInputRefs.current[index] = node;
                    }}
                    name={`code-${index + 1}`}
                    value={digit}
                    onChange={(event) => handleCodeDigitChange(index, event)}
                    onKeyDown={(event) => handleCodeDigitKeyDown(index, event)}
                    onPaste={handleCodePaste}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-label={`Code digit ${index + 1}`}
                    maxLength={1}
                    disabled={isSubmitting}
                    className="app-input-surface h-13.5 rounded-2xl text-center text-[20px] font-semibold tracking-[0.04em] text-(--app-text-strong) transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_24px_rgba(3,7,18,0.12)]"
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-[13px] tracking-[-0.02em] text-(--app-text-faint)">
              <span>Didn&apos;t get it?</span>

              {resendCooldown > 0 ? (
                <span>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendCode}
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isResending ? "Resending..." : "Resend code"}
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBackToEmailStep}
                disabled={isSubmitting}
                className="min-h-12.5 w-full rounded-2xl"
              >
                <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.1} />
                Back
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12.5 w-full rounded-2xl"
              >
                Continue
                <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.1} />
              </Button>
            </div>
          </form>
        ) : null}

        {step === "password" ? (
          <form onSubmit={handlePasswordStepSubmit} noValidate>
            <div>
              <label
                htmlFor="recovery-new-password"
                className="mb-3 block text-[13px] font-medium tracking-widest text-(--app-text-faint) uppercase"
              >
                New Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-(--app-input-icon)">
                  <LockKeyhole className="h-4.5 w-4.5" strokeWidth={2} />
                </div>

                <input
                  id="recovery-new-password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  disabled={isSubmitting}
                  placeholder="Create a secure password"
                  className="app-input-surface h-13.5 w-full rounded-2xl pr-12 pl-12 text-[16px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_24px_rgba(3,7,18,0.12)]"
                />

                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                  aria-label={
                    isPasswordVisible ? "Hide new password" : "Show new password"
                  }
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-(--app-text-soft) transition-colors hover:text-(--app-text-strong) disabled:pointer-events-none"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-4.5 w-4.5" strokeWidth={2} />
                  ) : (
                    <Eye className="h-4.5 w-4.5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="recovery-confirm-password"
                className="mb-3 block text-[13px] font-medium tracking-widest text-(--app-text-faint) uppercase"
              >
                Confirm Password
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-(--app-input-icon)">
                  <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2} />
                </div>

                <input
                  id="recovery-confirm-password"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                  disabled={isSubmitting}
                  placeholder="Repeat your password"
                  className="app-input-surface h-13.5 w-full rounded-2xl pr-12 pl-12 text-[16px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_10px_24px_rgba(3,7,18,0.12)]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setIsConfirmPasswordVisible((currentValue) => !currentValue)
                  }
                  aria-label={
                    isConfirmPasswordVisible
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-(--app-text-soft) transition-colors hover:text-(--app-text-strong) disabled:pointer-events-none"
                >
                  {isConfirmPasswordVisible ? (
                    <EyeOff className="h-4.5 w-4.5" strokeWidth={2} />
                  ) : (
                    <Eye className="h-4.5 w-4.5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              <PasswordRequirement
                label="At least 8 characters"
                passed={passwordChecks.minLength}
              />
              <PasswordRequirement
                label="At least one number"
                passed={passwordChecks.hasNumber}
              />
              <PasswordRequirement
                label="At least one uppercase letter"
                passed={passwordChecks.hasUppercase}
              />
              <PasswordRequirement
                label="Passwords match"
                passed={passwordChecks.passwordsMatch}
              />
            </ul>

            <div className="mt-6 grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBackToVerifyStep}
                disabled={isSubmitting}
                className="min-h-12.5 w-full rounded-2xl"
              >
                <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.1} />
                Back
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12.5 w-full rounded-2xl"
              >
                {isSubmitting ? "Updating password..." : "Update password"}
                <LockKeyhole className="h-4.5 w-4.5" strokeWidth={2} />
              </Button>
            </div>
          </form>
        ) : null}

        {step === "success" ? (
          <div className="py-3 text-center">
            <span className="mx-auto inline-flex h-13.5 w-13.5 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/14 text-emerald-300">
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </span>

            <h2 className="mt-4 text-[1.35rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
              Password updated
            </h2>

            <p className="mt-2 text-[15px] tracking-[-0.02em] text-(--app-text-soft)">
              You can sign in using your new password.
            </p>

            <Button
              href="/signin"
              className="mt-6 min-h-12.5 w-full rounded-2xl text-[15px] sm:text-[16px]"
            >
              Continue to sign in
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.1} />
            </Button>
          </div>
        ) : null}

        {errorMessage ? (
          <div
            aria-live="polite"
            className="mt-5 rounded-2xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-[14px] tracking-[-0.02em] text-red-500"
          >
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="mt-6 text-center text-[14px] tracking-[-0.02em] text-(--app-text-soft)">
        Remembered it?{" "}
        <Link
          href="/signin"
          className="font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
