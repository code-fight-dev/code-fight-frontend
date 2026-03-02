import { API_BASE_URL } from "@/shared/config/api";
import type { Viewer } from "@/entities/viewer";
import type { AuthMode, SignInPayload, SignUpPayload } from "../model/types";

type AuthResponse = {
  user: Viewer;
};

type AuthErrorResponse = {
  error?: string;
};

export function getOAuthStartUrl(provider: "github" | "google", mode: AuthMode) {
  return `${API_BASE_URL}/auth/oauth/${provider}/start?mode=${mode}`;
}

export async function submitAuth(mode: "signin", payload: SignInPayload): Promise<Viewer>;
export async function submitAuth(mode: "signup", payload: SignUpPayload): Promise<Viewer>;
export async function submitAuth(mode: AuthMode, payload: SignInPayload | SignUpPayload) {
  const response = await fetch(
    `${API_BASE_URL}/auth/${mode === "signup" ? "sign-up" : "sign-in"}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response.json().catch(() => null)) as
    | AuthResponse
    | AuthErrorResponse
    | null;

  if (!response.ok) {
    throw new Error(
      body && "error" in body && body.error ? body.error : "Authentication failed",
    );
  }

  return (body as AuthResponse).user;
}
