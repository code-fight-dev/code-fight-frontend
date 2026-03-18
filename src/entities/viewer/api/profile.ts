import { API_BASE_URL } from "@/shared/config/api";
import { isViewerProfile } from "../model/types";
import type { UpdateViewerProfileInput } from "../model/types";

type ProfileResponse = {
  profile?: unknown;
};

async function parseProfileResponse(response: Response, fallbackMessage: string) {
  const body = (await response.json().catch(() => null)) as ProfileResponse | null;

  if (!body || !isViewerProfile(body.profile)) {
    throw new Error(fallbackMessage);
  }

  return body.profile;
}

export async function getViewerProfile(username: string) {
  const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`, {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return parseProfileResponse(response, "Invalid profile response");
}

export async function updateViewerProfile(
  username: string,
  input: UpdateViewerProfileInput,
) {
  const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: input.displayName,
      bio: input.bio,
      country: input.country,
      countryCode: input.countryCode,
      stateProvince: input.stateProvince,
      city: input.city,
      avatarDataUrl: input.avatarDataUrl ?? "",
      removeCustomAvatar: input.removeCustomAvatar ?? false,
    }),
  });

  if (response.status === 401) {
    throw new Error("You need to sign in to edit this profile");
  }

  if (response.status === 403) {
    throw new Error("You can edit only your own profile");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message || "Failed to update profile");
  }

  return parseProfileResponse(response, "Invalid updated profile response");
}
