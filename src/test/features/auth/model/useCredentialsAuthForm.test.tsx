import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SIGN_IN_AUTH_PAGE, SIGN_UP_AUTH_PAGE } from "@/features/auth/model/config";
import { useCredentialsAuthForm } from "@/features/auth/model/useCredentialsAuthForm";
import { HOME_HREF } from "@/shared/config/routes";
import { createViewerWithUsername } from "@/test/fixtures/viewer";
import { createDeferred } from "@/test/helpers/deferred";

const authFormMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  setViewer: vi.fn(),
  submitAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: authFormMocks.push,
    refresh: authFormMocks.refresh,
  }),
}));

vi.mock("@/entities/viewer", () => ({
  useViewerSession: () => ({
    setViewer: authFormMocks.setViewer,
  }),
}));

vi.mock("@/features/auth/api/auth", () => ({
  submitAuth: authFormMocks.submitAuth,
}));

type HarnessProps = {
  config: typeof SIGN_IN_AUTH_PAGE | typeof SIGN_UP_AUTH_PAGE;
  oauthErrorCode?: string | null;
  email?: string;
  password?: string;
  username?: string;
  acceptedTerms?: boolean;
};

function CredentialsAuthFormHookHarness({
  config,
  oauthErrorCode = null,
  email = "",
  password = "",
  username = "",
  acceptedTerms = false,
}: HarnessProps) {
  const { errorMessage, handleSubmit, isSubmitting } = useCredentialsAuthForm({
    config,
    oauthErrorCode,
  });

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" defaultValue={email} />
      <input name="password" defaultValue={password} />
      <input name="username" defaultValue={username} />
      <input name="terms" type="checkbox" defaultChecked={acceptedTerms} />

      <button type="submit">submit</button>

      <span data-testid="is-submitting">{String(isSubmitting)}</span>
      <span data-testid="error-message">{errorMessage ?? "none"}</span>
    </form>
  );
}

describe("features/auth/model/useCredentialsAuthForm", () => {
  beforeEach(() => {
    authFormMocks.push.mockReset();
    authFormMocks.refresh.mockReset();
    authFormMocks.setViewer.mockReset();
    authFormMocks.submitAuth.mockReset();
  });

  it("initializes error message from oauth error code", () => {
    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        oauthErrorCode="oauth_provider_invalid"
      />,
    );

    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "The selected OAuth provider is not supported.",
    );
  });

  it("validates missing email", async () => {
    render(
      <CredentialsAuthFormHookHarness config={SIGN_IN_AUTH_PAGE} password="secret" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent("Email is required.");
      expect(authFormMocks.submitAuth).not.toHaveBeenCalled();
    });
  });

  it("validates invalid email format", async () => {
    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        email="alice"
        password="secret"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Enter a valid email address.",
      );
      expect(authFormMocks.submitAuth).not.toHaveBeenCalled();
    });
  });

  it("validates missing password", async () => {
    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        email="alice@example.com"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Password is required.",
      );
      expect(authFormMocks.submitAuth).not.toHaveBeenCalled();
    });
  });

  it("validates terms acceptance for signup", async () => {
    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_UP_AUTH_PAGE}
        email="alice@example.com"
        password="secret"
        username="alice"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "You must accept the terms to continue.",
      );
      expect(authFormMocks.submitAuth).not.toHaveBeenCalled();
    });
  });

  it("validates missing signup username", async () => {
    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_UP_AUTH_PAGE}
        email="alice@example.com"
        password="secret"
        acceptedTerms
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Username is required.",
      );
      expect(authFormMocks.submitAuth).not.toHaveBeenCalled();
    });
  });

  it("validates signup username without spaces", async () => {
    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_UP_AUTH_PAGE}
        email="alice@example.com"
        password="secret"
        username="alice coder"
        acceptedTerms
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Username must not contain spaces.",
      );
      expect(authFormMocks.submitAuth).not.toHaveBeenCalled();
    });
  });

  it("submits sign in credentials, updates viewer and redirects home", async () => {
    const viewer = createViewerWithUsername("alice", {
      id: "viewer-1",
      createdAt: "2026-05-25T10:00:00.000Z",
    });
    authFormMocks.submitAuth.mockResolvedValue(viewer);

    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        email="alice@example.com"
        password="secret"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(authFormMocks.submitAuth).toHaveBeenCalledWith("signin", {
        email: "alice@example.com",
        password: "secret",
      });
      expect(authFormMocks.setViewer).toHaveBeenCalledWith(viewer);
      expect(authFormMocks.push).toHaveBeenCalledWith(HOME_HREF);
      expect(authFormMocks.refresh).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");
      expect(screen.getByTestId("error-message")).toHaveTextContent("none");
    });
  });

  it("submits sign up payload with trimmed username and email", async () => {
    authFormMocks.submitAuth.mockResolvedValue(createViewerWithUsername("alice"));

    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_UP_AUTH_PAGE}
        email=" alice@example.com "
        password="secret"
        username=" alice "
        acceptedTerms
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(authFormMocks.submitAuth).toHaveBeenCalledWith("signup", {
        username: "alice",
        email: "alice@example.com",
        password: "secret",
      });
    });
  });

  it("exposes submitting state while auth request is in flight", async () => {
    const submitDeferred = createDeferred<ReturnType<typeof createViewerWithUsername>>();
    authFormMocks.submitAuth.mockImplementation(() => submitDeferred.promise);

    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        email="alice@example.com"
        password="secret"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("is-submitting")).toHaveTextContent("true");
    });

    submitDeferred.resolve(createViewerWithUsername("alice"));

    await waitFor(() => {
      expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");
    });
  });

  it("maps submit errors from backend to user-facing auth message", async () => {
    authFormMocks.submitAuth.mockRejectedValue(new Error("invalid credentials"));

    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        email="alice@example.com"
        password="wrong"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Email or password is incorrect.",
      );
      expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");
    });
  });

  it("uses fallback submit error message for non-Error rejections", async () => {
    authFormMocks.submitAuth.mockRejectedValue("failed");

    render(
      <CredentialsAuthFormHookHarness
        config={SIGN_IN_AUTH_PAGE}
        email="alice@example.com"
        password="wrong"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Authentication failed. Please try again.",
      );
      expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");
    });
  });
});
