import {
  DEFAULT_PREFERENCES,
  MOTION_PREFERENCE_COOKIE_KEY,
  PREFERENCES_COOKIE_MAX_AGE,
  PREFERENCES_STORAGE_KEY,
  THEME_PREFERENCE_COOKIE_KEY,
} from "./preferences";

export function getPreferencesInitScript() {
  return `(() => {
    const root = document.documentElement;
    const fallbackTheme = root.dataset.theme === "light" ? "light" : ${JSON.stringify(DEFAULT_PREFERENCES.theme)};
    const fallbackMotion = root.dataset.motion === "disabled" ? "disabled" : ${JSON.stringify(DEFAULT_PREFERENCES.motion)};

    try {
      const raw = window.localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)});
      const parsed = raw ? JSON.parse(raw) : {};
      const theme = parsed && parsed.theme === "light" ? "light" : fallbackTheme;
      const motion = parsed && parsed.motion === "disabled" ? "disabled" : fallbackMotion;
      const secureAttribute = window.location.protocol === "https:" ? "; secure" : "";
      const cookieAttributes = "; path=/; max-age=${PREFERENCES_COOKIE_MAX_AGE}; samesite=lax" + secureAttribute;

      root.dataset.theme = theme;
      root.dataset.motion = motion;
      root.style.colorScheme = theme === "light" ? "light" : "dark";
      document.cookie = ${JSON.stringify(THEME_PREFERENCE_COOKIE_KEY)} + "=" + encodeURIComponent(theme) + cookieAttributes;
      document.cookie = ${JSON.stringify(MOTION_PREFERENCE_COOKIE_KEY)} + "=" + encodeURIComponent(motion) + cookieAttributes;
    } catch (error) {
      root.dataset.theme = fallbackTheme;
      root.dataset.motion = fallbackMotion;
      root.style.colorScheme = fallbackTheme === "light" ? "light" : "dark";
    }
  })();`;
}
