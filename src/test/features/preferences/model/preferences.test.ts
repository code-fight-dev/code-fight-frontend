import { describe, expect, it } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import {
  DEFAULT_PREFERENCES,
  normalizeEditorPreferences,
  normalizeMotionPreference,
  normalizePreferences,
  normalizeThemePreference,
} from "@/features/preferences/model/preferences";

describe("features/preferences/model/preferences", () => {
  it("normalizes theme and motion preferences", () => {
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("default")).toBe("default");
    expect(normalizeThemePreference("unexpected")).toBe("default");

    expect(normalizeMotionPreference("disabled")).toBe("disabled");
    expect(normalizeMotionPreference("enabled")).toBe("enabled");
    expect(normalizeMotionPreference("unexpected")).toBe("enabled");
  });

  it("returns default editor preferences for non-object input", () => {
    expect(normalizeEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
    expect(normalizeEditorPreferences("bad-input")).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("keeps valid editor preferences as-is", () => {
    const editor = {
      fontFamily: "consolas",
      fontSize: 24,
      lineHeight: 36,
      tabSize: 8,
      wordWrap: "bounded",
      minimap: true,
      fontLigatures: false,
      smoothScrolling: false,
      formatOnPaste: false,
      cursorBlinking: "solid",
      paddingTop: 0,
      paddingBottom: 48,
      useAppTheme: false,
    } as const;

    expect(normalizeEditorPreferences(editor)).toEqual(editor);
  });

  it("normalizes invalid editor values and clamps numeric ranges", () => {
    const normalized = normalizeEditorPreferences({
      fontFamily: "comic",
      fontSize: Number.NaN,
      lineHeight: 999,
      tabSize: 1,
      wordWrap: "wrapped",
      minimap: "yes",
      fontLigatures: 1,
      smoothScrolling: undefined,
      formatOnPaste: null,
      cursorBlinking: "laser",
      paddingTop: -5,
      paddingBottom: 99,
      useAppTheme: "no",
    });

    expect(normalized).toEqual({
      fontFamily: DEFAULT_EDITOR_PREFERENCES.fontFamily,
      fontSize: DEFAULT_EDITOR_PREFERENCES.fontSize,
      lineHeight: 36,
      tabSize: 2,
      wordWrap: DEFAULT_EDITOR_PREFERENCES.wordWrap,
      minimap: DEFAULT_EDITOR_PREFERENCES.minimap,
      fontLigatures: DEFAULT_EDITOR_PREFERENCES.fontLigatures,
      smoothScrolling: DEFAULT_EDITOR_PREFERENCES.smoothScrolling,
      formatOnPaste: DEFAULT_EDITOR_PREFERENCES.formatOnPaste,
      cursorBlinking: DEFAULT_EDITOR_PREFERENCES.cursorBlinking,
      paddingTop: 0,
      paddingBottom: 48,
      useAppTheme: DEFAULT_EDITOR_PREFERENCES.useAppTheme,
    });
  });

  it("accepts every supported cursor blinking value", () => {
    const values = ["blink", "smooth", "phase", "expand", "solid"] as const;

    for (const value of values) {
      expect(
        normalizeEditorPreferences({
          cursorBlinking: value,
        }).cursorBlinking,
      ).toBe(value);
    }
  });

  it("returns default preferences for invalid root input", () => {
    expect(normalizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(normalizePreferences("bad-input")).toEqual(DEFAULT_PREFERENCES);
  });

  it("normalizes nested preferences object", () => {
    const normalized = normalizePreferences({
      theme: "light",
      motion: "disabled",
      editor: {
        fontFamily: "jetbrains-mono",
        fontSize: 20,
        lineHeight: 30,
        tabSize: 4,
        wordWrap: "off",
        minimap: true,
        fontLigatures: false,
        smoothScrolling: false,
        formatOnPaste: false,
        cursorBlinking: "phase",
        paddingTop: 4,
        paddingBottom: 8,
        useAppTheme: false,
      },
    });

    expect(normalized).toEqual({
      theme: "light",
      motion: "disabled",
      editor: {
        fontFamily: "jetbrains-mono",
        fontSize: 20,
        lineHeight: 30,
        tabSize: 4,
        wordWrap: "off",
        minimap: true,
        fontLigatures: false,
        smoothScrolling: false,
        formatOnPaste: false,
        cursorBlinking: "phase",
        paddingTop: 4,
        paddingBottom: 8,
        useAppTheme: false,
      },
    });
  });

  it("falls back to defaults for invalid top-level and nested values", () => {
    const normalized = normalizePreferences({
      theme: "neon",
      motion: "fast",
      editor: "invalid-editor-shape",
    });

    expect(normalized).toEqual({
      theme: DEFAULT_PREFERENCES.theme,
      motion: DEFAULT_PREFERENCES.motion,
      editor: DEFAULT_EDITOR_PREFERENCES,
    });
  });
});
