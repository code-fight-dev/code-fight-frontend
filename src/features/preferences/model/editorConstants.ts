import type {
  EditorCursorBlinking,
  EditorFontFamily,
  EditorPreferenceOption,
  EditorPreferences,
  EditorWordWrap,
} from "./editorTypes";

export const EDITOR_CURSOR_BLINKING_OPTIONS = [
  { value: "smooth", label: "Smooth" },
  { value: "blink", label: "Blink" },
  { value: "phase", label: "Phase" },
  { value: "expand", label: "Expand" },
  { value: "solid", label: "Solid" },
] as const satisfies readonly EditorPreferenceOption<EditorCursorBlinking>[];

export const EDITOR_WORD_WRAP_OPTIONS = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
  { value: "bounded", label: "Bounded" },
] as const satisfies readonly EditorPreferenceOption<EditorWordWrap>[];

export const EDITOR_FONT_FAMILY_OPTIONS = [
  { value: "accent", label: "Default Accent" },
  { value: "fira-code", label: "Fira Code" },
  { value: "jetbrains-mono", label: "JetBrains Mono" },
  { value: "cascadia-code", label: "Cascadia Code" },
  { value: "consolas", label: "Consolas" },
] as const satisfies readonly EditorPreferenceOption<EditorFontFamily>[];

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontFamily: "accent",
  fontSize: 14,
  lineHeight: 22,
  tabSize: 2,
  wordWrap: "on",
  minimap: false,
  fontLigatures: true,
  smoothScrolling: true,
  formatOnPaste: true,
  cursorBlinking: "smooth",
  paddingTop: 18,
  paddingBottom: 18,
  useAppTheme: true,
};
