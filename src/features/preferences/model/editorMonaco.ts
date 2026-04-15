import type * as MonacoTypes from "monaco-editor";

export type AppEditorTheme = "dark" | "light";
export type MonacoThemeName = "codefight-dark" | "codefight-light";

export function defineCodeFightMonacoThemes(monacoInstance: typeof MonacoTypes) {
  monacoInstance.editor.defineTheme("codefight-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "7dd3fc" },
      { token: "string", foreground: "a7f3d0" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "c4b5fd" },
      { token: "function", foreground: "93c5fd" },
    ],
    colors: {
      "editor.background": "#07090f",
      "editor.foreground": "#e5e7eb",
      "editor.lineHighlightBackground": "#ffffff08",
      "editorLineNumber.foreground": "#4b5563",
      "editorLineNumber.activeForeground": "#d1d5db",
      "editorCursor.foreground": "#67e8f9",
      "editor.selectionBackground": "#0891b244",
      "editor.inactiveSelectionBackground": "#155e7544",
      "editorIndentGuide.background1": "#ffffff12",
      "editorIndentGuide.activeBackground1": "#67e8f955",
    },
  });

  monacoInstance.editor.defineTheme("codefight-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "keyword", foreground: "2563eb" },
      { token: "string", foreground: "059669" },
      { token: "number", foreground: "d97706" },
      { token: "type", foreground: "7c3aed" },
      { token: "function", foreground: "0284c7" },
    ],
    colors: {
      "editor.background": "#f8fbff",
      "editor.foreground": "#0f172a",
      "editor.lineHighlightBackground": "#2563eb0d",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#334155",
      "editorCursor.foreground": "#2563eb",
      "editor.selectionBackground": "#93c5fd66",
      "editor.inactiveSelectionBackground": "#bfdbfe55",
      "editorIndentGuide.background1": "#cbd5e122",
      "editorIndentGuide.activeBackground1": "#60a5fa66",
    },
  });
}

export function getCurrentAppTheme(): AppEditorTheme {
  if (typeof document === "undefined") {
    return "dark";
  }

  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function resolveMonacoThemeName(
  appTheme: AppEditorTheme,
  useAppTheme: boolean,
): MonacoThemeName {
  if (!useAppTheme) {
    return "codefight-dark";
  }

  return appTheme === "light" ? "codefight-light" : "codefight-dark";
}
