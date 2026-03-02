import "server-only";

import { cookies } from "next/headers";
import {
  DEFAULT_PREFERENCES,
  MOTION_PREFERENCE_COOKIE_KEY,
  normalizeMotionPreference,
  normalizeThemePreference,
  THEME_PREFERENCE_COOKIE_KEY,
} from "./preferences";

export async function getPreferencesServer() {
  const cookieStore = await cookies();

  return {
    theme: normalizeThemePreference(
      cookieStore.get(THEME_PREFERENCE_COOKIE_KEY)?.value ?? DEFAULT_PREFERENCES.theme,
    ),
    motion: normalizeMotionPreference(
      cookieStore.get(MOTION_PREFERENCE_COOKIE_KEY)?.value ?? DEFAULT_PREFERENCES.motion,
    ),
  };
}
