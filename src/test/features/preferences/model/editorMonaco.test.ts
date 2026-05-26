import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defineCodeFightMonacoThemes,
  getCurrentAppTheme,
  resolveMonacoThemeName,
} from "@/features/preferences/model/editorMonaco";

describe("features/preferences/model/editorMonaco", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("defines both codefight monaco themes", () => {
    const defineTheme = vi.fn();
    const monacoInstance = {
      editor: {
        defineTheme,
      },
    };

    defineCodeFightMonacoThemes(monacoInstance as never);

    expect(defineTheme).toHaveBeenCalledTimes(2);
    expect(defineTheme).toHaveBeenNthCalledWith(
      1,
      "codefight-dark",
      expect.objectContaining({
        base: "vs-dark",
        inherit: true,
        rules: expect.any(Array),
        colors: expect.any(Object),
      }),
    );
    expect(defineTheme).toHaveBeenNthCalledWith(
      2,
      "codefight-light",
      expect.objectContaining({
        base: "vs",
        inherit: true,
        rules: expect.any(Array),
        colors: expect.any(Object),
      }),
    );
  });

  it("reads current app theme from document dataset", () => {
    document.documentElement.dataset.theme = "light";
    expect(getCurrentAppTheme()).toBe("light");

    document.documentElement.dataset.theme = "default";
    expect(getCurrentAppTheme()).toBe("dark");
  });

  it("falls back to dark app theme when document is unavailable", () => {
    vi.stubGlobal("document", undefined);
    expect(getCurrentAppTheme()).toBe("dark");
  });

  it("resolves monaco theme name based on app theme and useAppTheme flag", () => {
    expect(resolveMonacoThemeName("light", true)).toBe("codefight-light");
    expect(resolveMonacoThemeName("dark", true)).toBe("codefight-dark");
    expect(resolveMonacoThemeName("light", false)).toBe("codefight-dark");
    expect(resolveMonacoThemeName("dark", false)).toBe("codefight-dark");
  });
});
