import { describe, expect, it } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import {
  buildMonacoEditorOptions,
  resolveEditorFontFamily,
} from "@/features/preferences/model/editorMonacoOptions";

describe("features/preferences/model/editorMonacoOptions", () => {
  it("resolves editor font families", () => {
    expect(resolveEditorFontFamily("accent")).toContain("var(--font-accent)");
    expect(resolveEditorFontFamily("fira-code")).toContain('"Fira Code"');
    expect(resolveEditorFontFamily("jetbrains-mono")).toContain('"JetBrains Mono"');
    expect(resolveEditorFontFamily("cascadia-code")).toContain('"Cascadia Code"');
    expect(resolveEditorFontFamily("consolas")).toContain("Consolas");
  });

  it("builds monaco options from editor preferences", () => {
    const options = buildMonacoEditorOptions({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontFamily: "jetbrains-mono",
      fontSize: 19,
      lineHeight: 28,
      tabSize: 4,
      wordWrap: "bounded",
      minimap: true,
      fontLigatures: false,
      smoothScrolling: false,
      formatOnPaste: false,
      cursorBlinking: "phase",
      paddingTop: 6,
      paddingBottom: 10,
    });

    expect(options).toEqual(
      expect.objectContaining({
        automaticLayout: true,
        cursorBlinking: "phase",
        fontFamily: expect.stringContaining('"JetBrains Mono"'),
        fontSize: 19,
        fontLigatures: false,
        formatOnPaste: false,
        lineHeight: 28,
        renderLineHighlight: "gutter",
        scrollBeyondLastLine: false,
        smoothScrolling: false,
        tabSize: 4,
        wordWrap: "bounded",
      }),
    );
    expect(options.minimap).toEqual({ enabled: true });
    expect(options.padding).toEqual({ top: 6, bottom: 10 });
    expect(options.guides).toEqual({ indentation: true });
    expect(options.bracketPairColorization).toEqual({ enabled: true });
  });
});
