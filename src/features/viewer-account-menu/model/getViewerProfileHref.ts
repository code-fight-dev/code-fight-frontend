import { SETTINGS_APPEARANCE_HREF } from "@/shared/config/routes";

export function getViewerProfileHref(username: string) {
  return `/u/${encodeURIComponent(username)}`;
}

export const VIEWER_SETTINGS_HREF = SETTINGS_APPEARANCE_HREF;
