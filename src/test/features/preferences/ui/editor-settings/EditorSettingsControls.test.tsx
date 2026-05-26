import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  SelectField,
  SliderField as SettingsSliderField,
  ToggleField,
} from "@/features/preferences/ui/editor-settings/EditorSettingsControls";
import { SliderField as SharedSliderField } from "@/shared/ui/SliderField";

vi.mock("@/shared/ui/Select/useSelectListboxPosition", () => ({
  useSelectListboxPosition: () => ({
    top: 100,
    left: 120,
    width: 260,
  }),
}));

describe("features/preferences/ui/editor-settings/EditorSettingsControls", () => {
  it("renders select field with hint and applies selected value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SelectField
        label="Word wrap"
        description="Control long line wrapping."
        hint="Helpful details about wrap modes."
        value="on"
        options={[
          { value: "on", label: "On" },
          { value: "off", label: "Off" },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByText("Word wrap")).toBeInTheDocument();
    expect(screen.getByText("Control long line wrapping.")).toBeInTheDocument();
    expect(screen.getByText("Helpful details about wrap modes.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More info" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Word wrap" }));
    await user.click(within(screen.getByRole("listbox")).getByText("Off"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("off");
  });

  it("renders select field without tooltip when hint is not provided", () => {
    render(
      <SelectField
        label="Cursor blinking"
        description="Choose cursor animation."
        value="smooth"
        options={[
          { value: "smooth", label: "Smooth" },
          { value: "phase", label: "Phase" },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "More info" })).not.toBeInTheDocument();
  });

  it("uses a div shell in the public select field API", () => {
    const { container } = render(
      <SelectField
        label="Font family"
        description="Choose monospace stack."
        value="accent"
        options={[
          { value: "accent", label: "Default Accent" },
          { value: "consolas", label: "Consolas" },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(container.firstElementChild).toBeInstanceOf(HTMLDivElement);
  });

  it("passes className to the field shell", () => {
    const { container } = render(
      <SelectField
        label="Font family"
        description="Choose monospace stack."
        value="accent"
        options={[
          { value: "accent", label: "Default Accent" },
          { value: "consolas", label: "Consolas" },
        ]}
        className="custom-shell-class"
        onChange={vi.fn()}
      />,
    );

    expect(container.firstElementChild).toHaveClass("custom-shell-class");
  });

  it("toggles between on and off states", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ToggleField
        label="Minimap"
        description="Show miniature code map."
        value
        onChange={onChange}
      />,
    );

    const group = screen.getByRole("group", { name: "Minimap toggle" });
    const onButton = within(group).getByRole("button", { name: "On" });
    const offButton = within(group).getByRole("button", { name: "Off" });

    expect(onButton).toHaveAttribute("aria-pressed", "true");
    expect(offButton).toHaveAttribute("aria-pressed", "false");

    await user.click(offButton);
    await user.click(onButton);

    expect(onChange).toHaveBeenNthCalledWith(1, false);
    expect(onChange).toHaveBeenNthCalledWith(2, true);
  });

  it("re-exports shared slider field component", () => {
    expect(SettingsSliderField).toBe(SharedSliderField);
  });
});
