import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import type { PreferencesState } from "@/features/preferences/model/types";

const providerMocks = vi.hoisted(() => ({
  usePreferences: vi.fn(),
}));

vi.mock("@/features/preferences/ui/PreferencesProvider", () => ({
  usePreferences: providerMocks.usePreferences,
}));

import {
  AppearanceSettingsPanel,
  PerformanceSettingsPanel,
  PreferencesSettingsPanel,
} from "@/features/preferences/ui/PreferencesSettingsPanel";

function createPreferences(overrides: Partial<PreferencesState> = {}): PreferencesState {
  return {
    theme: "default",
    motion: "enabled",
    editor: DEFAULT_EDITOR_PREFERENCES,
    ...overrides,
  };
}

describe("features/preferences/ui/PreferencesSettingsPanel", () => {
  beforeEach(() => {
    providerMocks.usePreferences.mockReset();
  });

  it("renders appearance and performance sections", () => {
    providerMocks.usePreferences.mockReturnValue({
      preferences: createPreferences(),
      setTheme: vi.fn(),
      setMotion: vi.fn(),
    });

    render(<PreferencesSettingsPanel />);

    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Motion" })).toBeInTheDocument();
    expect(screen.getAllByRole("radiogroup")).toHaveLength(2);
  });

  it("wires appearance and performance selection handlers", async () => {
    const user = userEvent.setup();
    const setTheme = vi.fn();
    const setMotion = vi.fn();

    providerMocks.usePreferences.mockReturnValue({
      preferences: createPreferences(),
      setTheme,
      setMotion,
    });

    render(<PreferencesSettingsPanel />);

    await user.click(screen.getByDisplayValue("default"));
    await user.click(screen.getByDisplayValue("enabled"));
    await user.click(screen.getByDisplayValue("light"));
    await user.click(screen.getByDisplayValue("disabled"));

    expect(setTheme).toHaveBeenCalledTimes(1);
    expect(setTheme).toHaveBeenCalledWith("light");
    expect(setMotion).toHaveBeenCalledTimes(1);
    expect(setMotion).toHaveBeenCalledWith("disabled");
  });

  it("renders single section variants", () => {
    providerMocks.usePreferences.mockReturnValue({
      preferences: createPreferences({
        theme: "light",
        motion: "disabled",
      }),
      setTheme: vi.fn(),
      setMotion: vi.fn(),
    });

    const { rerender } = render(<AppearanceSettingsPanel />);
    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getAllByText("Light").length).toBeGreaterThan(0);

    rerender(<PerformanceSettingsPanel />);
    expect(screen.getByRole("heading", { name: "Motion" })).toBeInTheDocument();
    expect(screen.getAllByText("Reduced").length).toBeGreaterThan(0);
  });
});
