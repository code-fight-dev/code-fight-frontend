import { buildViewerProfileHref, SETTINGS_PROFILE_HREF } from "@/shared/config/routes";

export function getViewerProfileHref(username: string) {
  return buildViewerProfileHref(username);
}

export const VIEWER_SETTINGS_HREF = SETTINGS_PROFILE_HREF;
