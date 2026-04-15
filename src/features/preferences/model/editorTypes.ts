export type EditorCursorBlinking = "blink" | "smooth" | "phase" | "expand" | "solid";

export type EditorWordWrap = "off" | "on" | "bounded";

export type EditorFontFamily =
  | "accent"
  | "fira-code"
  | "jetbrains-mono"
  | "cascadia-code"
  | "consolas";

export type EditorPreferences = {
  fontFamily: EditorFontFamily;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  wordWrap: EditorWordWrap;
  minimap: boolean;
  fontLigatures: boolean;
  smoothScrolling: boolean;
  formatOnPaste: boolean;
  cursorBlinking: EditorCursorBlinking;
  paddingTop: number;
  paddingBottom: number;
  useAppTheme: boolean;
};

export type EditorPreferenceOption<T extends string> = Readonly<{
  value: T;
  label: string;
}>;
