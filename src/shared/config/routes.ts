import type { Route } from "next";

export const HOME_HREF: Route = "/";
export const RANKING_HREF: Route = "/ranking";

export const SETTINGS_ROUTES = {
  profile: "/settings/profile",
  appearance: "/settings/appearance",
  performance: "/settings/performance",
} as const satisfies Record<string, Route>;

export type SettingsSectionId = keyof typeof SETTINGS_ROUTES;
export type SettingsRoute = (typeof SETTINGS_ROUTES)[keyof typeof SETTINGS_ROUTES];

export const SETTINGS_PROFILE_HREF = SETTINGS_ROUTES.profile;
export const SETTINGS_APPEARANCE_HREF = SETTINGS_ROUTES.appearance;
export const SETTINGS_PERFORMANCE_HREF = SETTINGS_ROUTES.performance;

export function buildViewerProfileHref(username: string): Route {
  return `/u/${encodeURIComponent(username)}` as Route;
}
