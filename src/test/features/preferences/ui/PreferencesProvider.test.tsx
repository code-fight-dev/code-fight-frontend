import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/features/preferences/model/editor";
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

function createPreferences(overrides: Partial<PreferencesState> = {}): PreferencesState {
  return {
    theme: "default",
    motion: "enabled",
    editor: DEFAULT_EDITOR_PREFERENCES,
    ...overrides,
  };
}

function createEditorPreferences(
  overrides: Partial<EditorPreferences> = {},
): EditorPreferences {
  return {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...overrides,
  };
}

function PreferencesHarness() {
  const {
    preferences,
    setTheme,
    setMotion,
    updateEditorPreferences,
    resetEditorPreferences,
  } = usePreferences();

  return (
    <div>
      <div data-testid="theme">{preferences.theme}</div>
      <div data-testid="motion">{preferences.motion}</div>
      <div data-testid="font-size">{String(preferences.editor.fontSize)}</div>
      <div data-testid="word-wrap">{preferences.editor.wordWrap}</div>

      <button type="button" onClick={() => setTheme("light")}>
        set-theme-light
      </button>
      <button type="button" onClick={() => setMotion("disabled")}>
        set-motion-disabled
      </button>
      <button
        type="button"
        onClick={() =>
          updateEditorPreferences({
            fontSize: 20,
            wordWrap: "off",
          })
        }
      >
        patch-editor
      </button>
      <button type="button" onClick={resetEditorPreferences}>
        reset-editor
      </button>
    </div>
  );
}

function HookOutsideProvider() {
  usePreferences();
  return null;
}

describe("features/preferences/ui/PreferencesProvider", () => {
  beforeEach(() => {
    documentModelMocks.applyPreferencesToDocument.mockReset();
    documentModelMocks.persistPreferences.mockReset();
    documentModelMocks.readPreferencesFromStorage.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when usePreferences is used outside provider", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<HookOutsideProvider />)).toThrow(
      "usePreferences must be used within PreferencesProvider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("initializes from storage and applies preferences on mount", () => {
    const storedPreferences = createPreferences({
      theme: "light",
      motion: "disabled",
      editor: createEditorPreferences({
        fontSize: 18,
      }),
    });
    documentModelMocks.readPreferencesFromStorage.mockReturnValue(storedPreferences);

    render(
      <PreferencesProvider initialPreferences={createPreferences()}>
        <PreferencesHarness />
      </PreferencesProvider>,
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(screen.getByTestId("motion")).toHaveTextContent("disabled");
    expect(screen.getByTestId("font-size")).toHaveTextContent("18");
    expect(documentModelMocks.readPreferencesFromStorage).toHaveBeenCalledTimes(1);
    expect(documentModelMocks.applyPreferencesToDocument).toHaveBeenCalledWith(
      storedPreferences,
    );
    expect(documentModelMocks.persistPreferences).toHaveBeenCalledWith(storedPreferences);
  });

  it("updates theme, motion and editor preferences through context actions", async () => {
    documentModelMocks.readPreferencesFromStorage.mockReturnValue(createPreferences());

    render(
      <PreferencesProvider initialPreferences={createPreferences()}>
        <PreferencesHarness />
      </PreferencesProvider>,
    );

    documentModelMocks.applyPreferencesToDocument.mockClear();
    documentModelMocks.persistPreferences.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "set-theme-light" }));
    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("light");
      expect(documentModelMocks.applyPreferencesToDocument).toHaveBeenLastCalledWith(
        expect.objectContaining({ theme: "light" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "set-motion-disabled" }));
    await waitFor(() => {
      expect(screen.getByTestId("motion")).toHaveTextContent("disabled");
      expect(documentModelMocks.persistPreferences).toHaveBeenLastCalledWith(
        expect.objectContaining({ motion: "disabled" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "patch-editor" }));
    await waitFor(() => {
      expect(screen.getByTestId("font-size")).toHaveTextContent("20");
      expect(screen.getByTestId("word-wrap")).toHaveTextContent("off");
      expect(documentModelMocks.persistPreferences).toHaveBeenLastCalledWith(
        expect.objectContaining({
          editor: expect.objectContaining({
            fontSize: 20,
            wordWrap: "off",
          }),
        }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "reset-editor" }));
    await waitFor(() => {
      expect(screen.getByTestId("font-size")).toHaveTextContent(
        String(DEFAULT_EDITOR_PREFERENCES.fontSize),
      );
      expect(screen.getByTestId("word-wrap")).toHaveTextContent(
        DEFAULT_EDITOR_PREFERENCES.wordWrap,
      );
      expect(documentModelMocks.applyPreferencesToDocument).toHaveBeenLastCalledWith(
        expect.objectContaining({
          editor: DEFAULT_EDITOR_PREFERENCES,
        }),
      );
    });
  });
});
