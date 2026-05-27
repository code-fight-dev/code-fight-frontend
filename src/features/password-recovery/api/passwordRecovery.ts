import { API_BASE_URL } from "@/shared/config/api";

type PasswordRecoveryErrorResponse = {
  error?: string;
};

type RequestPasswordResetPayload = {
  email: string;
  captchaToken?: string;
};

type ConfirmPasswordResetPayload = {
  email: string;
  code: string;
  password: string;
};

async function submitPasswordRecoveryRequest(
  path: "/auth/password-reset/request" | "/auth/password-reset/confirm",
  payload: RequestPasswordResetPayload | ConfirmPasswordResetPayload,
  fallbackErrorMessage: string,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response
    .json()
    .catch(() => null)) as PasswordRecoveryErrorResponse | null;

  if (!response.ok) {
    throw new Error(
      body && "error" in body && body.error ? body.error : fallbackErrorMessage,
    );
  }
}

export function requestPasswordReset(payload: RequestPasswordResetPayload) {
  return submitPasswordRecoveryRequest(
    "/auth/password-reset/request",
    payload,
    "Could not send password reset code",
  );
}

export function confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
  return submitPasswordRecoveryRequest(
    "/auth/password-reset/confirm",
    payload,
    "Could not reset password",
  );
}
