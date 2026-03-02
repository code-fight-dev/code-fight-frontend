export function getViewerProfileHref(username: string) {
  return `/u/${encodeURIComponent(username)}`;
}

export const VIEWER_SETTINGS_HREF = "/settings";
