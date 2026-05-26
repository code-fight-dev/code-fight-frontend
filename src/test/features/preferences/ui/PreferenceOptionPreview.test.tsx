import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import { PreferenceOptionPreview } from "@/features/preferences/ui/PreferenceOptionPreview";

function renderPreview(
  variant: ComponentProps<typeof PreferenceOptionPreview>["variant"],
) {
  const { container } = render(<PreferenceOptionPreview variant={variant} />);
  const shell = container.firstElementChild as HTMLElement | null;

  if (!shell) {
    throw new Error("Expected preview shell to be rendered");
  }

  return shell;
}

describe("features/preferences/ui/PreferenceOptionPreview", () => {
  it("renders dark theme preview", () => {
    const shell = renderPreview("dark-theme");

    expect(shell).toHaveClass("app-settings-preview-shell");
    expect(shell).toHaveClass("bg-[#091120]");
    expect(shell).toHaveClass("text-white");
  });

  it("renders light theme preview", () => {
    const shell = renderPreview("light-theme");

    expect(shell).toHaveClass("app-settings-preview-shell");
    expect(shell).toHaveClass("bg-[#f9fbff]");
    expect(shell).toHaveClass("text-slate-900");
  });

  it("renders standard motion preview", () => {
    const shell = renderPreview("standard-motion");
    const content = shell.firstElementChild as HTMLElement | null;

    expect(shell).toHaveClass("app-settings-preview-shell");
    expect(content).toHaveClass("relative");
    expect(content).toHaveClass("h-full");
    expect(content).toHaveClass("overflow-hidden");
    expect(
      Array.from(shell.querySelectorAll("span")).filter((element) =>
        element.className.includes("blur-[1px]"),
      ),
    ).toHaveLength(2);
  });

  it("renders reduced motion preview", () => {
    const shell = renderPreview("reduced-motion");
    const content = shell.firstElementChild as HTMLElement | null;

    expect(shell).toHaveClass("app-settings-preview-shell");
    expect(content).toHaveClass("flex");
    expect(content).toHaveClass("justify-center");
    expect(content).toHaveClass("gap-2");
  });
});
