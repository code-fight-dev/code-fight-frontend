import "server-only";

import { cookies } from "next/headers";
import type { PreferencesState } from "./types";
import {
  DEFAULT_PREFERENCES,
  MOTION_PREFERENCE_COOKIE_KEY,
  normalizeMotionPreference,
  normalizeThemePreference,
  THEME_PREFERENCE_COOKIE_KEY,
} from "./preferences";

export async function getPreferencesServer(): Promise<PreferencesState> {
  const cookieStore = await cookies();

  return {
    ...DEFAULT_PREFERENCES,
    theme: normalizeThemePreference(
      cookieStore.get(THEME_PREFERENCE_COOKIE_KEY)?.value ?? DEFAULT_PREFERENCES.theme,
    ),
    motion: normalizeMotionPreference(
      cookieStore.get(MOTION_PREFERENCE_COOKIE_KEY)?.value ?? DEFAULT_PREFERENCES.motion,
    ),
  };
}
