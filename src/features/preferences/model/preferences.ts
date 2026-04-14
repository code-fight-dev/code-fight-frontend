import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorCursorBlinking,
  type EditorFontFamily,
  type EditorPreferences,
  type EditorWordWrap,
} from "@/features/preferences/model/editor";
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
  editor: DEFAULT_EDITOR_PREFERENCES,
};

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === "light" ? "light" : "default";
}

export function normalizeMotionPreference(value: unknown): MotionPreference {
  return value === "disabled" ? "disabled" : "enabled";
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

function normalizeCursorBlinking(value: unknown): EditorCursorBlinking {
  switch (value) {
    case "blink":
    case "smooth":
    case "phase":
    case "expand":
    case "solid":
      return value;
    default:
      return DEFAULT_EDITOR_PREFERENCES.cursorBlinking;
  }
}

function normalizeWordWrap(value: unknown): EditorWordWrap {
  switch (value) {
    case "off":
    case "on":
    case "bounded":
      return value;
    default:
      return DEFAULT_EDITOR_PREFERENCES.wordWrap;
  }
}

function normalizeFontFamily(value: unknown): EditorFontFamily {
  switch (value) {
    case "accent":
    case "fira-code":
    case "jetbrains-mono":
    case "cascadia-code":
    case "consolas":
      return value;
    default:
      return DEFAULT_EDITOR_PREFERENCES.fontFamily;
  }
}

export function normalizeEditorPreferences(value: unknown): EditorPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  const candidate = value as Partial<EditorPreferences>;

  return {
    fontFamily: normalizeFontFamily(candidate.fontFamily),
    fontSize: normalizeNumber(
      candidate.fontSize,
      DEFAULT_EDITOR_PREFERENCES.fontSize,
      12,
      24,
    ),
    lineHeight: normalizeNumber(
      candidate.lineHeight,
      DEFAULT_EDITOR_PREFERENCES.lineHeight,
      18,
      36,
    ),
    tabSize: normalizeNumber(candidate.tabSize, DEFAULT_EDITOR_PREFERENCES.tabSize, 2, 8),
    wordWrap: normalizeWordWrap(candidate.wordWrap),
    minimap: normalizeBoolean(candidate.minimap, DEFAULT_EDITOR_PREFERENCES.minimap),
    fontLigatures: normalizeBoolean(
      candidate.fontLigatures,
      DEFAULT_EDITOR_PREFERENCES.fontLigatures,
    ),
    smoothScrolling: normalizeBoolean(
      candidate.smoothScrolling,
      DEFAULT_EDITOR_PREFERENCES.smoothScrolling,
    ),
    formatOnPaste: normalizeBoolean(
      candidate.formatOnPaste,
      DEFAULT_EDITOR_PREFERENCES.formatOnPaste,
    ),
    cursorBlinking: normalizeCursorBlinking(candidate.cursorBlinking),
    paddingTop: normalizeNumber(
      candidate.paddingTop,
      DEFAULT_EDITOR_PREFERENCES.paddingTop,
      0,
      48,
    ),
    paddingBottom: normalizeNumber(
      candidate.paddingBottom,
      DEFAULT_EDITOR_PREFERENCES.paddingBottom,
      0,
      48,
    ),
    useAppTheme: normalizeBoolean(
      candidate.useAppTheme,
      DEFAULT_EDITOR_PREFERENCES.useAppTheme,
    ),
  };
}

export function normalizePreferences(raw: unknown): PreferencesState {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_PREFERENCES;
  }

  const candidate = raw as Partial<PreferencesState>;

  return {
    theme: normalizeThemePreference(candidate.theme),
    motion: normalizeMotionPreference(candidate.motion),
    editor: normalizeEditorPreferences(candidate.editor),
  };
}
