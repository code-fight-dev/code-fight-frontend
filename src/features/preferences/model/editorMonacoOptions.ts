import type { editor } from "monaco-editor";
import type { EditorFontFamily, EditorPreferences } from "./editorTypes";

export function resolveEditorFontFamily(fontFamily: EditorFontFamily) {
  switch (fontFamily) {
    case "fira-code":
      return `var(--font-editor-fira), "Fira Code", "JetBrains Mono", var(--font-accent), monospace`;
    case "jetbrains-mono":
      return `var(--font-editor-jetbrains), "JetBrains Mono", "Fira Code", var(--font-accent), monospace`;
    case "cascadia-code":
      return `"Cascadia Code", "Cascadia Mono", var(--font-editor-fira), var(--font-accent), monospace`;
    case "consolas":
      return `Consolas, "Cascadia Code", var(--font-editor-fira), var(--font-accent), monospace`;
    case "accent":
    default:
      return `var(--font-accent), var(--font-editor-fira), SFMono-Regular, Consolas, Liberation Mono, monospace`;
  }
}

export function buildMonacoEditorOptions(
  preferences: EditorPreferences,
): editor.IStandaloneEditorConstructionOptions {
  return {
    automaticLayout: true,
    bracketPairColorization: {
      enabled: true,
    },
    cursorBlinking: preferences.cursorBlinking,
    fontFamily: resolveEditorFontFamily(preferences.fontFamily),
    fontSize: preferences.fontSize,
    fontLigatures: preferences.fontLigatures,
    formatOnPaste: preferences.formatOnPaste,
    guides: {
      indentation: true,
    },
    lineHeight: preferences.lineHeight,
    minimap: {
      enabled: preferences.minimap,
    },
    padding: {
      top: preferences.paddingTop,
      bottom: preferences.paddingBottom,
    },
    renderLineHighlight: "gutter",
    scrollBeyondLastLine: false,
    smoothScrolling: preferences.smoothScrolling,
    tabSize: preferences.tabSize,
    wordWrap: preferences.wordWrap,
  };
}
