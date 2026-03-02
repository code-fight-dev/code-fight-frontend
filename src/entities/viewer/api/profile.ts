import { API_BASE_URL } from "@/shared/config/api";
import type { ViewerProfile } from "../model/types";

type ProfileResponse = {
  profile: ViewerProfile;
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

  const body = (await response.json()) as ProfileResponse;
  return body.profile;
}
