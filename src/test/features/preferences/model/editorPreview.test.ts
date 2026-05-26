import { describe, expect, it } from "vitest";

import {
  EDITOR_PREVIEW_CODE,
  getEditorPreviewThemeLabel,
} from "@/features/preferences/model/editorPreview";

describe("features/preferences/model/editorPreview", () => {
  it("contains sample code for preview surface", () => {
    expect(EDITOR_PREVIEW_CODE).toContain("type Duelist");
    expect(EDITOR_PREVIEW_CODE).toContain("selectFeaturedPlayers");
    expect(EDITOR_PREVIEW_CODE).toContain("Ligature sample");
  });

  it("returns human-readable theme labels", () => {
    expect(getEditorPreviewThemeLabel("codefight-light")).toBe("Light");
    expect(getEditorPreviewThemeLabel("codefight-dark")).toBe("Dark");
  });
});
