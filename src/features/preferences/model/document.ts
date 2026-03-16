import {
  DEFAULT_PREFERENCES,
  MOTION_PREFERENCE_COOKIE_KEY,
  normalizePreferences,
  PREFERENCES_COOKIE_MAX_AGE,
  PREFERENCES_STORAGE_KEY,
  THEME_PREFERENCE_COOKIE_KEY,
} from "./preferences";
import type { PreferencesState } from "./types";

function getPreferencesCookieAttributes() {
  const secureAttribute = window.location.protocol === "https:" ? "; secure" : "";
  return `path=/; max-age=${PREFERENCES_COOKIE_MAX_AGE}; samesite=lax${secureAttribute}`;
}

export function applyPreferencesToDocument(preferences: PreferencesState) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = preferences.theme;
  root.dataset.motion = preferences.motion;
  root.style.colorScheme = preferences.theme === "light" ? "light" : "dark";
}

export function readPreferencesFromDocument(): PreferencesState {
  if (typeof document === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  return normalizePreferences({
    theme: document.documentElement.dataset.theme,
    motion: document.documentElement.dataset.motion,
  });
}

export function readPreferencesFromStorage(): PreferencesState {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    return normalizePreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function persistPreferences(preferences: PreferencesState) {
  if (typeof window === "undefined") {
    return;
  }

  const cookieAttributes = getPreferencesCookieAttributes();

  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  document.cookie =
    `${THEME_PREFERENCE_COOKIE_KEY}=${encodeURIComponent(preferences.theme)}; ` +
    cookieAttributes;
  document.cookie =
    `${MOTION_PREFERENCE_COOKIE_KEY}=${encodeURIComponent(preferences.motion)}; ` +
    cookieAttributes;
}
