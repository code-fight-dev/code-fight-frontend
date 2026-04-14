import type { EditorPreferences } from "./editor";

export type ThemePreference = "default" | "light";

export type MotionPreference = "enabled" | "disabled";

export type PreferencesState = {
  theme: ThemePreference;
  motion: MotionPreference;
  editor: EditorPreferences;
};
