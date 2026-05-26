import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import type { PreferencesState } from "@/features/preferences/model/types";

const providerMocks = vi.hoisted(() => ({
  usePreferences: vi.fn(),
}));

vi.mock("@/features/preferences/ui/PreferencesProvider", () => ({
  usePreferences: providerMocks.usePreferences,
}));

vi.mock("@/shared/ui/Toast", () => ({
  Toast: ({ message }: { message: string | null }) => (
    <div data-testid="toast">{message ?? ""}</div>
  ),
}));

vi.mock("@/features/preferences/ui/editor-settings/EditorSettingsHeader", () => ({
  EditorSettingsHeader: ({
    isDefault,
    onReset,
  }: {
    isDefault: boolean;
    onReset: () => void;
  }) => (
    <button
      type="button"
      data-testid="reset-button"
      data-is-default={String(isDefault)}
      onClick={onReset}
    >
      reset
    </button>
  ),
}));

vi.mock("@/features/preferences/ui/editor-settings/EditorSettingsPreview", () => ({
  EditorSettingsPreview: ({
    preferences,
  }: {
    preferences: { fontSize: number; wordWrap: string };
  }) => (
    <div data-testid="editor-preview">
      {preferences.fontSize}:{preferences.wordWrap}
    </div>
  ),
}));

vi.mock("@/features/preferences/ui/editor-settings/EditorSettingsSections", () => ({
  EditorBehaviorSection: ({
    onChange,
  }: {
    onChange: (patch: { minimap: boolean }) => void;
  }) => (
    <button type="button" onClick={() => onChange({ minimap: true })}>
      behavior-change
    </button>
  ),
  EditorTypographySection: ({
    onChange,
  }: {
    onChange: (patch: { fontSize: number }) => void;
  }) => (
    <button type="button" onClick={() => onChange({ fontSize: 20 })}>
      typography-change
    </button>
  ),
}));

import { EditorSettingsPanel } from "@/features/preferences/ui/editor-settings/EditorSettingsPanel";

function createPreferences(overrides: Partial<PreferencesState> = {}): PreferencesState {
  return {
    theme: "default",
    motion: "enabled",
    editor: DEFAULT_EDITOR_PREFERENCES,
    ...overrides,
  };
}

describe("features/preferences/ui/editor-settings/EditorSettingsPanel", () => {
  beforeEach(() => {
    providerMocks.usePreferences.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("wires editor patch handlers into behavior and typography sections", () => {
    const updateEditorPreferences = vi.fn();

    providerMocks.usePreferences.mockReturnValue({
      preferences: createPreferences(),
      updateEditorPreferences,
      resetEditorPreferences: vi.fn(),
    });

    render(<EditorSettingsPanel />);

    expect(screen.getByTestId("editor-preview")).toHaveTextContent("14:on");
    expect(screen.getByTestId("reset-button")).toHaveAttribute("data-is-default", "true");

    fireEvent.click(screen.getByRole("button", { name: "behavior-change" }));
    fireEvent.click(screen.getByRole("button", { name: "typography-change" }));

    expect(updateEditorPreferences).toHaveBeenNthCalledWith(1, { minimap: true });
    expect(updateEditorPreferences).toHaveBeenNthCalledWith(2, { fontSize: 20 });
  });

  it("resets editor preferences and clears toast after timeout", () => {
    vi.useFakeTimers();
    const resetEditorPreferences = vi.fn();

    providerMocks.usePreferences.mockReturnValue({
      preferences: createPreferences({
        editor: {
          ...DEFAULT_EDITOR_PREFERENCES,
          fontSize: 18,
        },
      }),
      updateEditorPreferences: vi.fn(),
      resetEditorPreferences,
    });

    render(<EditorSettingsPanel />);

    expect(screen.getByTestId("reset-button")).toHaveAttribute(
      "data-is-default",
      "false",
    );
    expect(screen.getByTestId("toast")).toHaveTextContent("");

    fireEvent.click(screen.getByTestId("reset-button"));

    expect(resetEditorPreferences).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("toast")).toHaveTextContent(
      "Editor settings reset to defaults",
    );

    act(() => {
      vi.advanceTimersByTime(2800);
    });

    expect(screen.getByTestId("toast")).toHaveTextContent("");
  });
});
