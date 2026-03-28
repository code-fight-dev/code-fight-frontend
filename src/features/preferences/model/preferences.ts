import type {
  MotionPreference,
  PreferencesState,
  ThemePreference,
} from "@/features/preferences/model/types";

export const PREFERENCES_STORAGE_KEY = "codefight.preferences";
export const THEME_PREFERENCE_COOKIE_KEY = "codefight.theme";
export const MOTION_PREFERENCE_COOKIE_KEY = "codefight.motion";
export const PREFERENCES_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const DEFAULT_PREFERENCES: PreferencesState = {
  theme: "default",
  motion: "enabled",
};

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === "light" ? "light" : "default";
}

export function normalizeMotionPreference(value: unknown): MotionPreference {
  return value === "disabled" ? "disabled" : "enabled";
}

export function normalizePreferences(raw: unknown): PreferencesState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_PREFERENCES;
  }

  const candidate = raw as Partial<PreferencesState>;

  return {
    theme: normalizeThemePreference(candidate.theme),
    motion: normalizeMotionPreference(candidate.motion),
  };
}
