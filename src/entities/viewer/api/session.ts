import { API_BASE_URL } from "@/shared/config/api";
import { isViewer } from "../model/types";

type CurrentViewerResponse = {
  user?: unknown;
};

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

  const body = (await response.json().catch(() => null)) as CurrentViewerResponse | null;

  if (!body || !isViewer(body.user)) {
    throw new Error("Invalid current user response");
  }

  return body.user;
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
