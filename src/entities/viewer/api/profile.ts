import { API_BASE_URL } from "@/shared/config/api";
import { isViewerProfile } from "../model/types";

type ProfileResponse = {
  profile?: unknown;
};

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

  const body = (await response.json().catch(() => null)) as ProfileResponse | null;

  if (!body || !isViewerProfile(body.profile)) {
    throw new Error("Invalid profile response");
  }

  return body.profile;
}
