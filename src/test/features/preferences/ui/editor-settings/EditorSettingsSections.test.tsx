import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_EDITOR_PREFERENCES } from "@/features/preferences/model/editor";
import {
  EditorBehaviorSection,
  EditorTypographySection,
} from "@/features/preferences/ui/editor-settings/EditorSettingsSections";

vi.mock("@/shared/ui/Select/useSelectListboxPosition", () => ({
  useSelectListboxPosition: () => ({
    top: 90,
    left: 80,
    width: 260,
  }),
}));

async function chooseSelectOption(label: string, optionLabel: string) {
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: label }));
  await user.click(within(screen.getByRole("listbox")).getByText(optionLabel));
}

describe("features/preferences/ui/editor-settings/EditorSettingsSections", () => {
  it("maps behavior controls to editor preference patches", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <EditorBehaviorSection editor={DEFAULT_EDITOR_PREFERENCES} onChange={onChange} />,
    );

    expect(screen.getByRole("heading", { name: "Behavior" })).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("group", { name: "Use app theme toggle" })).getByRole(
        "button",
        { name: "Off" },
      ),
    );

    await chooseSelectOption("Cursor blinking", "Phase");
    await chooseSelectOption("Word wrap", "Off");

    await user.click(
      within(screen.getByRole("group", { name: "Minimap toggle" })).getByRole("button", {
        name: "On",
      }),
    );
    await user.click(
      within(screen.getByRole("group", { name: "Font ligatures toggle" })).getByRole(
        "button",
        { name: "Off" },
      ),
    );
    await user.click(
      within(screen.getByRole("group", { name: "Smooth scrolling toggle" })).getByRole(
        "button",
        { name: "Off" },
      ),
    );
    await user.click(
      within(screen.getByRole("group", { name: "Format on paste toggle" })).getByRole(
        "button",
        { name: "Off" },
      ),
    );

    expect(onChange.mock.calls.map(([patch]) => patch)).toEqual([
      { useAppTheme: false },
      { cursorBlinking: "phase" },
      { wordWrap: "off" },
      { minimap: true },
      { fontLigatures: false },
      { smoothScrolling: false },
      { formatOnPaste: false },
    ]);
  });

  it("maps typography controls to editor preference patches", async () => {
    const onChange = vi.fn();

    render(
      <EditorTypographySection editor={DEFAULT_EDITOR_PREFERENCES} onChange={onChange} />,
    );

    expect(
      screen.getByRole("heading", { name: "Typography and spacing" }),
    ).toBeInTheDocument();

    await chooseSelectOption("Font family", "Consolas");
    fireEvent.change(screen.getByRole("slider", { name: "Font size" }), {
      target: { value: "19" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "Line height" }), {
      target: { value: "28" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "Tab size" }), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "Top padding" }), {
      target: { value: "8" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "Bottom padding" }), {
      target: { value: "12" },
    });

    expect(onChange.mock.calls.map(([patch]) => patch)).toEqual([
      { fontFamily: "consolas" },
      { fontSize: 19 },
      { lineHeight: 28 },
      { tabSize: 4 },
      { paddingTop: 8 },
      { paddingBottom: 12 },
    ]);
  });
});
