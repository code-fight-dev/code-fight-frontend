import type { Route } from "next";

export const SETTINGS_ROUTES = {
  appearance: "/settings/appearance",
  performance: "/settings/performance",
} as const satisfies Record<string, Route>;

export type SettingsSectionId = keyof typeof SETTINGS_ROUTES;
export type SettingsRoute = (typeof SETTINGS_ROUTES)[keyof typeof SETTINGS_ROUTES];

export const SETTINGS_APPEARANCE_HREF = SETTINGS_ROUTES.appearance;
export const SETTINGS_PERFORMANCE_HREF = SETTINGS_ROUTES.performance;
