import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePasswordRecoveryFlow } from "@/features/password-recovery/model/usePasswordRecoveryFlow";

const passwordRecoveryMocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

const passwordRecoveryRecaptchaMocks = vi.hoisted(() => ({
  executePasswordResetRecaptcha: vi.fn(),
  isPasswordResetRecaptchaEnabled: vi.fn(),
}));

vi.mock("@/features/password-recovery/api/passwordRecovery", () => ({
  requestPasswordReset: passwordRecoveryMocks.requestPasswordReset,
  confirmPasswordReset: passwordRecoveryMocks.confirmPasswordReset,
}));

vi.mock("@/features/password-recovery/model/recaptcha", () => ({
  executePasswordResetRecaptcha:
    passwordRecoveryRecaptchaMocks.executePasswordResetRecaptcha,
  isPasswordResetRecaptchaEnabled:
    passwordRecoveryRecaptchaMocks.isPasswordResetRecaptchaEnabled,
}));

function resolveCaptchaAnswer(expression: string) {
  const match = expression.match(/(\d+)\s*([+-])\s*(\d+)/);
  if (!match) {
    throw new Error(`Unexpected captcha expression: ${expression}`);
  }

  const left = Number(match[1]);
  const operator = match[2];
  const right = Number(match[3]);

  return operator === "+" ? left + right : left - right;
}

function PasswordRecoveryHookHarness() {
  const {
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
    resendCooldown,
    setCaptchaAnswer,
    setConfirmPassword,
    setEmail,
    setPassword,
    step,
    password,
  } = usePasswordRecoveryFlow();

  return (
    <div>
      <span data-testid="step">{step}</span>
      <span data-testid="error-message">{errorMessage ?? "none"}</span>

      {step === "email" ? (
        <form onSubmit={handleEmailStepSubmit}>
          <input
            name="email"
            aria-label="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
          />
          <span data-testid="captcha-expression">{captchaExpression}</span>
          <input
            name="captcha"
            aria-label="captcha"
            value={captchaAnswer}
            onChange={(event) => setCaptchaAnswer(event.currentTarget.value)}
          />

          <button type="submit">send-code</button>
        </form>
      ) : null}

      {step === "verify" ? (
        <form onSubmit={handleVerifyStepSubmit}>
          {codeDigits.map((digit, index) => (
            <input
              key={`digit-${index + 1}`}
              ref={(node) => {
                codeInputRefs.current[index] = node;
              }}
              aria-label={`digit-${index + 1}`}
              value={digit}
              onChange={(event) => handleCodeDigitChange(index, event)}
              onKeyDown={(event) => handleCodeDigitKeyDown(index, event)}
              onPaste={handleCodePaste}
            />
          ))}

          <span data-testid="cooldown">{String(resendCooldown)}</span>

          <button type="button" onClick={handleResendCode}>
            resend
          </button>
          <button type="button" onClick={handleBackToEmailStep}>
            back-email
          </button>
          <button type="submit">verify</button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={handlePasswordStepSubmit}>
          <input
            name="password"
            aria-label="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <input
            name="confirm-password"
            aria-label="confirm-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
          />
          <button type="button" onClick={handleBackToVerifyStep}>
            back-verify
          </button>
          <button type="submit">update-password</button>
        </form>
      ) : null}

      <button type="button" onClick={handleResendCode}>
        resend-direct
      </button>
    </div>
  );
}

async function submitEmailStep({ email }: { email: string }) {
  fireEvent.change(screen.getByLabelText("email"), {
    target: {
      value: email,
    },
  });

  const expression = screen.getByTestId("captcha-expression").textContent ?? "";
  const answer = resolveCaptchaAnswer(expression);

  fireEvent.change(screen.getByLabelText("captcha"), {
    target: {
      value: String(answer),
    },
  });

  fireEvent.click(screen.getByRole("button", { name: "send-code" }));

  await waitFor(() => {
    expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenCalled();
  });
}

async function moveToPasswordStep() {
  await submitEmailStep({
    email: "coder@example.com",
  });

  await waitFor(() => {
    expect(screen.getByTestId("step")).toHaveTextContent("verify");
  });

  for (let index = 0; index < 6; index += 1) {
    fireEvent.change(screen.getByLabelText(`digit-${index + 1}`), {
      target: {
        value: String(index + 1),
      },
    });
  }

  fireEvent.click(screen.getByRole("button", { name: "verify" }));

  await waitFor(() => {
    expect(screen.getByTestId("step")).toHaveTextContent("password");
  });
}

describe("features/password-recovery/model/usePasswordRecoveryFlow", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    passwordRecoveryMocks.requestPasswordReset.mockReset();
    passwordRecoveryMocks.confirmPasswordReset.mockReset();
    passwordRecoveryMocks.requestPasswordReset.mockResolvedValue(undefined);
    passwordRecoveryMocks.confirmPasswordReset.mockResolvedValue(undefined);
    passwordRecoveryRecaptchaMocks.executePasswordResetRecaptcha.mockReset();
    passwordRecoveryRecaptchaMocks.isPasswordResetRecaptchaEnabled.mockReset();
    passwordRecoveryRecaptchaMocks.executePasswordResetRecaptcha.mockResolvedValue("");
    passwordRecoveryRecaptchaMocks.isPasswordResetRecaptchaEnabled.mockReturnValue(false);
  });

  it("starts on email step", () => {
    render(<PasswordRecoveryHookHarness />);

    expect(screen.getByTestId("step")).toHaveTextContent("email");
    expect(screen.getByLabelText("email")).toBeInTheDocument();
  });

  it("validates email before requesting reset code", async () => {
    render(<PasswordRecoveryHookHarness />);

    fireEvent.change(screen.getByLabelText("email"), {
      target: {
        value: "broken-email",
      },
    });

    const expression = screen.getByTestId("captcha-expression").textContent ?? "";
    const answer = resolveCaptchaAnswer(expression);

    fireEvent.change(screen.getByLabelText("captcha"), {
      target: {
        value: String(answer),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "send-code" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Enter a valid email address.",
      );
      expect(passwordRecoveryMocks.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("requires email before requesting reset code", async () => {
    render(<PasswordRecoveryHookHarness />);

    const expression = screen.getByTestId("captcha-expression").textContent ?? "";
    const answer = resolveCaptchaAnswer(expression);

    fireEvent.change(screen.getByLabelText("captcha"), {
      target: {
        value: String(answer),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "send-code" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent("Email is required.");
      expect(passwordRecoveryMocks.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("requires captcha answer before requesting reset code", async () => {
    render(<PasswordRecoveryHookHarness />);

    fireEvent.change(screen.getByLabelText("email"), {
      target: {
        value: "coder@example.com",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "send-code" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Captcha answer is required.",
      );
      expect(passwordRecoveryMocks.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("rejects incorrect captcha answer before calling backend", async () => {
    render(<PasswordRecoveryHookHarness />);

    fireEvent.change(screen.getByLabelText("email"), {
      target: {
        value: "coder@example.com",
      },
    });

    fireEvent.change(screen.getByLabelText("captcha"), {
      target: {
        value: "999",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "send-code" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Captcha answer is incorrect.",
      );
      expect(passwordRecoveryMocks.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("submits email step and moves to verify step", async () => {
    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: " CoDer@Example.com ",
    });

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
      expect(screen.getByTestId("cooldown")).toHaveTextContent("45");
      expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenCalledWith({
        email: "coder@example.com",
      });
    });
  });

  it("includes recaptcha token in reset request when recaptcha is enabled", async () => {
    passwordRecoveryRecaptchaMocks.isPasswordResetRecaptchaEnabled.mockReturnValue(true);
    passwordRecoveryRecaptchaMocks.executePasswordResetRecaptcha.mockResolvedValue(
      "token-123",
    );

    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: "coder@example.com",
    });

    await waitFor(() => {
      expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenCalledWith({
        email: "coder@example.com",
        captchaToken: "token-123",
      });
    });
  });

  it("maps backend request errors on email step", async () => {
    passwordRecoveryMocks.requestPasswordReset.mockRejectedValue(
      new Error("captcha verification failed"),
    );

    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: "coder@example.com",
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Captcha verification failed. Please try again.",
      );
      expect(screen.getByTestId("step")).toHaveTextContent("email");
    });
  });

  it("requires 6 digits before moving from verify step", async () => {
    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: "coder@example.com",
    });

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
    });

    fireEvent.click(screen.getByRole("button", { name: "verify" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Enter the 6-digit verification code.",
      );
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
    });
  });

  it("handles code digit keyboard and paste interactions", async () => {
    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: "coder@example.com",
    });

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
    });

    fireEvent.change(screen.getByLabelText("digit-1"), {
      target: {
        value: "a5",
      },
    });
    expect(screen.getByLabelText("digit-1")).toHaveValue("5");

    fireEvent.keyDown(screen.getByLabelText("digit-1"), {
      key: "ArrowLeft",
    });
    expect(screen.getByLabelText("digit-1")).toHaveValue("5");

    fireEvent.keyDown(screen.getByLabelText("digit-1"), {
      key: "Backspace",
    });
    expect(screen.getByLabelText("digit-1")).toHaveValue("");

    fireEvent.change(screen.getByLabelText("digit-1"), {
      target: {
        value: "9",
      },
    });
    fireEvent.keyDown(screen.getByLabelText("digit-2"), {
      key: "Backspace",
    });
    expect(screen.getByLabelText("digit-1")).toHaveValue("");

    fireEvent.paste(screen.getByLabelText("digit-1"), {
      clipboardData: {
        getData: () => "abc",
      },
    });
    for (let index = 0; index < 6; index += 1) {
      expect(screen.getByLabelText(`digit-${index + 1}`)).toHaveValue("");
    }
  });

  it("returns to email step from verify step", async () => {
    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: "coder@example.com",
    });

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
    });

    fireEvent.click(screen.getByRole("button", { name: "back-email" }));

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("email");
      expect(screen.getByLabelText("email")).toBeInTheDocument();
    });
  });

  it("resends code after cooldown ends, includes recaptcha token, and clears entered code", async () => {
    vi.useFakeTimers();

    passwordRecoveryRecaptchaMocks.isPasswordResetRecaptchaEnabled.mockReturnValue(true);
    passwordRecoveryRecaptchaMocks.executePasswordResetRecaptcha.mockResolvedValue(
      "resend-token",
    );

    render(<PasswordRecoveryHookHarness />);

    fireEvent.change(screen.getByLabelText("email"), {
      target: {
        value: "coder@example.com",
      },
    });

    const expression = screen.getByTestId("captcha-expression").textContent ?? "";
    const answer = resolveCaptchaAnswer(expression);

    fireEvent.change(screen.getByLabelText("captcha"), {
      target: {
        value: String(answer),
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "send-code" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("step")).toHaveTextContent("verify");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(45_000);
    });

    expect(screen.getByTestId("cooldown")).toHaveTextContent("0");

    for (let index = 0; index < 6; index += 1) {
      fireEvent.change(screen.getByLabelText(`digit-${index + 1}`), {
        target: {
          value: String(index + 1),
        },
      });
    }

    fireEvent.click(screen.getByRole("button", { name: "resend" }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenLastCalledWith({
      email: "coder@example.com",
      captchaToken: "resend-token",
    });

    for (let index = 0; index < 6; index += 1) {
      expect(screen.getByLabelText(`digit-${index + 1}`)).toHaveValue("");
    }
  });

  it("does not resend code while cooldown is active", async () => {
    render(<PasswordRecoveryHookHarness />);

    await submitEmailStep({
      email: "coder@example.com",
    });

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
      expect(screen.getByTestId("cooldown")).toHaveTextContent("45");
    });

    fireEvent.click(screen.getByRole("button", { name: "resend" }));

    await waitFor(() => {
      expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenCalledTimes(1);
    });
  });

  it("does not resend code when email is empty", async () => {
    render(<PasswordRecoveryHookHarness />);

    fireEvent.click(screen.getByRole("button", { name: "resend-direct" }));

    await waitFor(() => {
      expect(passwordRecoveryMocks.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  it("maps resend errors after cooldown ends", async () => {
    render(<PasswordRecoveryHookHarness />);

    fireEvent.change(screen.getByLabelText("email"), {
      target: {
        value: "coder@example.com",
      },
    });

    passwordRecoveryMocks.requestPasswordReset.mockRejectedValueOnce(
      new Error("password reset code is expired"),
    );

    fireEvent.click(screen.getByRole("button", { name: "resend-direct" }));

    await waitFor(() => {
      expect(passwordRecoveryMocks.requestPasswordReset).toHaveBeenCalledWith({
        email: "coder@example.com",
      });
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Verification code expired. Request a new code.",
      );
    });
  });

  it("confirms password reset and moves to success step", async () => {
    render(<PasswordRecoveryHookHarness />);

    await moveToPasswordStep();

    fireEvent.change(screen.getByLabelText("password"), {
      target: {
        value: "Secret123",
      },
    });
    fireEvent.change(screen.getByLabelText("confirm-password"), {
      target: {
        value: "Secret123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "update-password" }));

    await waitFor(() => {
      expect(passwordRecoveryMocks.confirmPasswordReset).toHaveBeenCalledWith({
        email: "coder@example.com",
        code: "123456",
        password: "Secret123",
      });
      expect(screen.getByTestId("step")).toHaveTextContent("success");
    });
  });

  it("returns to verify step from password step", async () => {
    render(<PasswordRecoveryHookHarness />);

    await moveToPasswordStep();

    fireEvent.click(screen.getByRole("button", { name: "back-verify" }));

    await waitFor(() => {
      expect(screen.getByTestId("step")).toHaveTextContent("verify");
    });
  });

  it("validates password requirements before confirmation", async () => {
    render(<PasswordRecoveryHookHarness />);

    await moveToPasswordStep();

    fireEvent.click(screen.getByRole("button", { name: "update-password" }));
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "New password is required.",
      );
    });

    fireEvent.change(screen.getByLabelText("password"), {
      target: {
        value: "Short1A",
      },
    });
    fireEvent.change(screen.getByLabelText("confirm-password"), {
      target: {
        value: "Short1A",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "update-password" }));
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Password must be between 8 and 72 characters.",
      );
    });

    fireEvent.change(screen.getByLabelText("password"), {
      target: {
        value: "lowercase1",
      },
    });
    fireEvent.change(screen.getByLabelText("confirm-password"), {
      target: {
        value: "lowercase1",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "update-password" }));
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Password must include at least one uppercase letter.",
      );
    });

    fireEvent.change(screen.getByLabelText("password"), {
      target: {
        value: "NoNumbers",
      },
    });
    fireEvent.change(screen.getByLabelText("confirm-password"), {
      target: {
        value: "NoNumbers",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "update-password" }));
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Password must include at least one number.",
      );
    });

    fireEvent.change(screen.getByLabelText("password"), {
      target: {
        value: "Secret123",
      },
    });
    fireEvent.change(screen.getByLabelText("confirm-password"), {
      target: {
        value: "Secret124",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "update-password" }));
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Passwords do not match.",
      );
    });

    expect(passwordRecoveryMocks.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it("maps backend confirmation errors", async () => {
    passwordRecoveryMocks.confirmPasswordReset.mockRejectedValue(
      new Error("password reset code is invalid"),
    );

    render(<PasswordRecoveryHookHarness />);

    await moveToPasswordStep();

    fireEvent.change(screen.getByLabelText("password"), {
      target: {
        value: "Secret123",
      },
    });
    fireEvent.change(screen.getByLabelText("confirm-password"), {
      target: {
        value: "Secret123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "update-password" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Verification code is invalid. Please try again.",
      );
      expect(screen.getByTestId("step")).toHaveTextContent("password");
    });
  });
});
