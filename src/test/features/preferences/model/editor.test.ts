import { describe, expect, it } from "vitest";

import {
  DEFAULT_EDITOR_PREFERENCES,
  EDITOR_CURSOR_BLINKING_OPTIONS,
  EDITOR_FONT_FAMILY_OPTIONS,
  EDITOR_WORD_WRAP_OPTIONS,
} from "@/features/preferences/model/editor";

describe("features/preferences/model/editor exports", () => {
  it("exposes default editor preferences and options", () => {
    expect(DEFAULT_EDITOR_PREFERENCES.fontFamily).toBe("accent");
    expect(EDITOR_CURSOR_BLINKING_OPTIONS.map((item) => item.value)).toEqual([
      "smooth",
      "blink",
      "phase",
      "expand",
      "solid",
    ]);
    expect(EDITOR_WORD_WRAP_OPTIONS.map((item) => item.value)).toEqual([
      "on",
      "off",
      "bounded",
    ]);
    expect(EDITOR_FONT_FAMILY_OPTIONS.map((item) => item.value)).toEqual([
      "accent",
      "fira-code",
      "jetbrains-mono",
      "cascadia-code",
      "consolas",
    ]);
  });
});
