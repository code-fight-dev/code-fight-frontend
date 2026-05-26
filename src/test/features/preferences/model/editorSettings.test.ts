import { describe, expect, it } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import { isDefaultEditorPreferences } from "@/features/preferences/model/editorSettings";

describe("features/preferences/model/editorSettings", () => {
  it("returns true for default editor preferences", () => {
    expect(isDefaultEditorPreferences(DEFAULT_EDITOR_PREFERENCES)).toBe(true);
  });

  it("returns false when any editor preference value differs", () => {
    expect(
      isDefaultEditorPreferences({
        ...DEFAULT_EDITOR_PREFERENCES,
        fontSize: DEFAULT_EDITOR_PREFERENCES.fontSize + 1,
      }),
    ).toBe(false);
  });
});
