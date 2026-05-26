import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoonStar, SunMedium } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import type { PreferenceOption } from "@/features/preferences/model/definitions";
import { PreferenceSection } from "@/features/preferences/ui/PreferenceSection";

type ThemeValue = "default" | "light";

const themeOptions = [
  {
    value: "default",
    label: "Dark",
    eyebrow: "Low-light",
    description: "Deeper contrast for focus-heavy sessions.",
    details: ["Higher contrast", "Blue accents"],
    previewVariant: "dark-theme",
    icon: MoonStar,
  },
  {
    value: "light",
    label: "Light",
    eyebrow: "Daylight",
    description: "Brighter canvas with softer contrast edges.",
    details: ["Airier surface", "Sharper text"],
    previewVariant: "light-theme",
    icon: SunMedium,
  },
] as const satisfies readonly PreferenceOption<ThemeValue>[];

describe("features/preferences/ui/PreferenceSection", () => {
  it("renders section structure with radio semantics and details", () => {
    render(
      <PreferenceSection
        name="theme-preference"
        eyebrow="Appearance"
        title="Theme"
        description="Pick the palette that feels most comfortable."
        options={themeOptions}
        currentValue="default"
        currentLabel="Dark"
        onSelect={vi.fn()}
      />,
    );

    const radiogroup = screen.getByRole("radiogroup");
    const darkRadio = screen.getByDisplayValue("default");
    const lightRadio = screen.getByDisplayValue("light");
    const lightLabel = lightRadio.closest("label");

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Theme" })).toBeInTheDocument();
    expect(
      screen.getByText("Pick the palette that feels most comfortable."),
    ).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getAllByText("Dark").length).toBeGreaterThan(0);
    expect(screen.getByText("Higher contrast")).toBeInTheDocument();
    expect(screen.getByText("Airier surface")).toBeInTheDocument();

    expect(radiogroup).toHaveAttribute("aria-labelledby");
    expect(radiogroup).toHaveAttribute("aria-describedby");

    expect(darkRadio).toBeChecked();
    expect(lightRadio).not.toBeChecked();
    expect(lightLabel).toHaveClass("border-t");
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  it("selects only inactive option and ignores click on already active option", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <PreferenceSection
        name="theme-preference"
        eyebrow="Appearance"
        title="Theme"
        description="Pick the palette that feels most comfortable."
        options={themeOptions}
        currentValue="default"
        currentLabel="Dark"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByDisplayValue("default"), {
      target: { checked: false },
    });
    await user.click(screen.getByDisplayValue("light"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("light");
  });
});
