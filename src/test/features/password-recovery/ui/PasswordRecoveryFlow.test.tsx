import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PasswordRecoveryFlow } from "@/features/password-recovery/ui/PasswordRecoveryFlow";

const flowMocks = vi.hoisted(() => ({
  usePasswordRecoveryFlow: vi.fn(),
}));

vi.mock("@/features/password-recovery/model/usePasswordRecoveryFlow", () => ({
  usePasswordRecoveryFlow: flowMocks.usePasswordRecoveryFlow,
}));

function createFlowState(overrides: Record<string, unknown> = {}) {
  return {
    activeStepIndex: 0,
    captchaAnswer: "",
    captchaExpression: "8 + 2 = ?",
    codeDigits: ["", "", "", "", "", ""],
    codeInputRefs: {
      current: [],
    },
    confirmPassword: "",
    email: "",
    errorMessage: null,
    handleBackToEmailStep: vi.fn(),
    handleBackToVerifyStep: vi.fn(),
    handleCodeDigitChange: vi.fn(),
    handleCodeDigitKeyDown: vi.fn(),
    handleCodePaste: vi.fn(),
    handleEmailStepSubmit: vi.fn(),
    handlePasswordStepSubmit: vi.fn(),
    handleResendCode: vi.fn(),
    handleVerifyStepSubmit: vi.fn(),
    isGoogleRecaptchaEnabled: false,
    isResending: false,
    isSubmitting: false,
    maskedEmail: "co********@example.com",
    password: "",
    passwordChecks: {
      minLength: false,
      hasNumber: false,
      hasUppercase: false,
      passwordsMatch: false,
    },
    refreshCaptcha: vi.fn(),
    resendCooldown: 45,
    setCaptchaAnswer: vi.fn(),
    setConfirmPassword: vi.fn(),
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    step: "email",
    ...overrides,
  };
}

describe("features/password-recovery/ui/PasswordRecoveryFlow", () => {
  beforeEach(() => {
    flowMocks.usePasswordRecoveryFlow.mockReset();
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(createFlowState());
  });

  it("renders email step by default", () => {
    render(<PasswordRecoveryFlow />);

    expect(
      screen.getByRole("heading", { name: "Forgot password", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send code" })).toBeInTheDocument();
    expect(screen.getByTestId("captcha-expression")).toHaveTextContent("8 + 2 = ?");
    expect(screen.queryByText("Protected by Google reCAPTCHA.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/signin",
    );
  });

  it("wires email step inputs and actions to flow handlers", () => {
    const setEmail = vi.fn();
    const setCaptchaAnswer = vi.fn();
    const refreshCaptcha = vi.fn();
    const handleEmailStepSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "email",
        setEmail,
        setCaptchaAnswer,
        refreshCaptcha,
        handleEmailStepSubmit,
      }),
    );

    render(<PasswordRecoveryFlow />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        value: "coder@example.com",
      },
    });

    expect(setEmail).toHaveBeenCalledWith("coder@example.com");

    fireEvent.change(screen.getByLabelText("Captcha - Confirm You're Human"), {
      target: {
        value: "10",
      },
    });

    expect(setCaptchaAnswer).toHaveBeenCalledWith("10");

    fireEvent.click(screen.getByRole("button", { name: "Refresh captcha" }));
    expect(refreshCaptcha).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Send code" }));
    expect(handleEmailStepSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows recaptcha hint and submitting label on email step", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        isGoogleRecaptchaEnabled: true,
        isSubmitting: true,
      }),
    );

    render(<PasswordRecoveryFlow />);

    expect(screen.getByRole("button", { name: "Sending code..." })).toBeDisabled();
    expect(screen.getByText("Protected by Google reCAPTCHA.")).toBeInTheDocument();
    expect(screen.queryByTestId("captcha-expression")).not.toBeInTheDocument();
  });

  it("renders verify step with cooldown timer", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "verify",
        activeStepIndex: 1,
        resendCooldown: 12,
      }),
    );

    render(<PasswordRecoveryFlow />);

    expect(
      screen.getByRole("heading", { name: "Check your inbox", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Resend in 12s")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resend code" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(6);
  });

  it("wires verify step inputs and actions to flow handlers", () => {
    const handleCodeDigitChange = vi.fn();
    const handleCodeDigitKeyDown = vi.fn();
    const handleCodePaste = vi.fn();
    const handleBackToEmailStep = vi.fn();
    const handleVerifyStepSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    const handleResendCode = vi.fn();

    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "verify",
        activeStepIndex: 1,
        resendCooldown: 0,
        handleCodeDigitChange,
        handleCodeDigitKeyDown,
        handleCodePaste,
        handleBackToEmailStep,
        handleVerifyStepSubmit,
        handleResendCode,
      }),
    );

    render(<PasswordRecoveryFlow />);

    const firstDigitInput = screen.getByLabelText("Code digit 1");

    fireEvent.change(firstDigitInput, {
      target: {
        value: "1",
      },
    });

    expect(handleCodeDigitChange).toHaveBeenCalledWith(0, expect.any(Object));

    fireEvent.keyDown(firstDigitInput, {
      key: "Backspace",
    });

    expect(handleCodeDigitKeyDown).toHaveBeenCalledWith(0, expect.any(Object));

    fireEvent.paste(firstDigitInput, {
      clipboardData: {
        getData: () => "123456",
      },
    });

    expect(handleCodePaste).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Resend code" }));
    expect(handleResendCode).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(handleBackToEmailStep).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(handleVerifyStepSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders resend action state on verify step when cooldown is over", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "verify",
        activeStepIndex: 1,
        resendCooldown: 0,
        isResending: true,
      }),
    );

    render(<PasswordRecoveryFlow />);

    expect(screen.getByRole("button", { name: "Resending..." })).toBeDisabled();
  });

  it("renders password step and toggles password visibility", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "password",
        activeStepIndex: 2,
        passwordChecks: {
          minLength: true,
          hasNumber: true,
          hasUppercase: false,
          passwordsMatch: false,
        },
      }),
    );

    render(<PasswordRecoveryFlow />);

    const newPasswordInput = screen.getByLabelText("New Password");
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(screen.getByText("At least one uppercase letter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update password" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show new password" }));
    expect(newPasswordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide new password" })).toBeInTheDocument();
  });

  it("wires password step inputs and actions to flow handlers", () => {
    const setPassword = vi.fn();
    const setConfirmPassword = vi.fn();
    const handleBackToVerifyStep = vi.fn();
    const handlePasswordStepSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "password",
        activeStepIndex: 2,
        setPassword,
        setConfirmPassword,
        handleBackToVerifyStep,
        handlePasswordStepSubmit,
      }),
    );

    render(<PasswordRecoveryFlow />);

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: {
        value: "Secret123",
      },
    });

    expect(setPassword).toHaveBeenCalledWith("Secret123");

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: {
        value: "Secret123",
      },
    });

    expect(setConfirmPassword).toHaveBeenCalledWith("Secret123");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(handleBackToVerifyStep).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(handlePasswordStepSubmit).toHaveBeenCalledTimes(1);
  });

  it("toggles confirm password visibility", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "password",
        activeStepIndex: 2,
        confirmPassword: "Secret123",
      }),
    );

    render(<PasswordRecoveryFlow />);

    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show confirm password" }));

    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    expect(
      screen.getByRole("button", { name: "Hide confirm password" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hide confirm password" }));

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("shows submitting label on password step", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "password",
        activeStepIndex: 2,
        isSubmitting: true,
      }),
    );

    render(<PasswordRecoveryFlow />);

    expect(screen.getByRole("button", { name: "Updating password..." })).toBeDisabled();
  });

  it("renders success state with sign-in call to action", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        step: "success",
        activeStepIndex: 3,
      }),
    );

    render(<PasswordRecoveryFlow />);

    expect(
      screen.getByRole("heading", { name: "All set", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Password updated", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue to sign in" })).toHaveAttribute(
      "href",
      "/signin",
    );
  });

  it("renders error message block when error is present", () => {
    flowMocks.usePasswordRecoveryFlow.mockReturnValue(
      createFlowState({
        errorMessage: "Captcha verification failed. Please try again.",
      }),
    );

    render(<PasswordRecoveryFlow />);

    expect(
      screen.getByText("Captcha verification failed. Please try again."),
    ).toBeInTheDocument();
  });
});
