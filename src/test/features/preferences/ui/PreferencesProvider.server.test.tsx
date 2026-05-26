// @vitest-environment node

import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import type { PreferencesState } from "@/features/preferences/model/types";

const documentModelMocks = vi.hoisted(() => ({
  applyPreferencesToDocument: vi.fn(),
  persistPreferences: vi.fn(),
  readPreferencesFromStorage: vi.fn(),
}));

vi.mock("@/features/preferences/model/document", () => ({
  applyPreferencesToDocument: documentModelMocks.applyPreferencesToDocument,
  persistPreferences: documentModelMocks.persistPreferences,
  readPreferencesFromStorage: documentModelMocks.readPreferencesFromStorage,
}));

import {
  PreferencesProvider,
  usePreferences,
} from "@/features/preferences/ui/PreferencesProvider";

function ServerHarness() {
  const { preferences } = usePreferences();

  return (
    <div>
      {preferences.theme}:{preferences.motion}:{preferences.editor.fontSize}
    </div>
  );
}

describe("features/preferences/ui/PreferencesProvider server rendering", () => {
  it("uses initial preferences when window is unavailable", () => {
    const initialPreferences: PreferencesState = {
      theme: "light",
      motion: "disabled",
      editor: {
        ...DEFAULT_EDITOR_PREFERENCES,
        fontSize: 19,
      },
    };

    documentModelMocks.readPreferencesFromStorage.mockReturnValue({
      theme: "default",
      motion: "enabled",
      editor: DEFAULT_EDITOR_PREFERENCES,
    });

    const html = renderToString(
      <PreferencesProvider initialPreferences={initialPreferences}>
        <ServerHarness />
      </PreferencesProvider>,
    );

    expect(html).toContain("light");
    expect(html).toContain("disabled");
    expect(html).toContain("19");
    expect(documentModelMocks.readPreferencesFromStorage).not.toHaveBeenCalled();
    expect(documentModelMocks.applyPreferencesToDocument).not.toHaveBeenCalled();
    expect(documentModelMocks.persistPreferences).not.toHaveBeenCalled();
  });
});
