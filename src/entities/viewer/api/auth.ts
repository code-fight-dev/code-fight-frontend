import { API_BASE_URL } from "@/shared/config/api";
import type { AuthMode, SignInPayload, SignUpPayload, Viewer } from "../model/types";

type AuthResponse = {
  user: Viewer;
};

type AuthErrorResponse = {
  error?: string;
};

export function getOAuthStartUrl(provider: "github" | "google", mode: AuthMode) {
  return `${API_BASE_URL}/auth/oauth/${provider}/start?mode=${mode}`;
}

export async function getCurrentViewer(signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
    signal,
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
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

export async function signOutViewer() {
  const response = await fetch(`${API_BASE_URL}/auth/sign-out`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to sign out");
  }
}
