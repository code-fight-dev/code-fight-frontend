import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SIGN_IN_AUTH_PAGE, SIGN_UP_AUTH_PAGE } from "@/features/auth/model/config";
import { CredentialsAuthForm } from "@/features/auth/ui/CredentialsAuthForm";

const credentialsFormMocks = vi.hoisted(() => ({
  useCredentialsAuthForm: vi.fn(),
}));

vi.mock("@/features/auth/model/useCredentialsAuthForm", () => ({
  useCredentialsAuthForm: credentialsFormMocks.useCredentialsAuthForm,
}));

describe("features/auth/ui/CredentialsAuthForm", () => {
  beforeEach(() => {
    credentialsFormMocks.useCredentialsAuthForm.mockReset();
    credentialsFormMocks.useCredentialsAuthForm.mockReturnValue({
      errorMessage: null,
      handleSubmit: vi.fn((event: Event) => event.preventDefault()),
      isSubmitting: false,
    });
  });

  it("renders sign in fields and default submit label", () => {
    render(<CredentialsAuthForm config={SIGN_IN_AUTH_PAGE} oauthErrorCode={null} />);

    expect(screen.getByText(SIGN_IN_AUTH_PAGE.dividerLabel)).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: SIGN_IN_AUTH_PAGE.submitLabel }),
    ).toBeInTheDocument();
  });

  it("renders terms checkbox and links for sign up mode", () => {
    render(<CredentialsAuthForm config={SIGN_UP_AUTH_PAGE} oauthErrorCode={null} />);

    expect(screen.getByLabelText("Accept terms and privacy policy")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: SIGN_UP_AUTH_PAGE.terms?.serviceLabel ?? "" }),
    ).toHaveAttribute("href", SIGN_UP_AUTH_PAGE.terms?.serviceHref);
    expect(
      screen.getByRole("link", { name: SIGN_UP_AUTH_PAGE.terms?.privacyLabel ?? "" }),
    ).toHaveAttribute("href", SIGN_UP_AUTH_PAGE.terms?.privacyHref);
  });

  it("renders error message from hook state", () => {
    credentialsFormMocks.useCredentialsAuthForm.mockReturnValue({
      errorMessage: "Email is required.",
      handleSubmit: vi.fn((event: Event) => event.preventDefault()),
      isSubmitting: false,
    });

    render(<CredentialsAuthForm config={SIGN_IN_AUTH_PAGE} oauthErrorCode={null} />);

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
  });

  it("shows mode-specific pending submit label and disables inputs", () => {
    credentialsFormMocks.useCredentialsAuthForm.mockReturnValue({
      errorMessage: null,
      handleSubmit: vi.fn((event: Event) => event.preventDefault()),
      isSubmitting: true,
    });

    render(<CredentialsAuthForm config={SIGN_UP_AUTH_PAGE} oauthErrorCode={null} />);

    expect(screen.getByRole("button", { name: "Creating account..." })).toBeDisabled();
    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByLabelText("Accept terms and privacy policy")).toBeDisabled();
  });

  it("delegates form submission to hook handler", () => {
    const handleSubmit = vi.fn((event: Event) => event.preventDefault());
    credentialsFormMocks.useCredentialsAuthForm.mockReturnValue({
      errorMessage: null,
      handleSubmit,
      isSubmitting: false,
    });

    const { container } = render(
      <CredentialsAuthForm config={SIGN_IN_AUTH_PAGE} oauthErrorCode={null} />,
    );

    const form = container.querySelector("form");
    if (!form) {
      throw new Error("Expected CredentialsAuthForm to render a form element");
    }

    fireEvent.submit(form);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
