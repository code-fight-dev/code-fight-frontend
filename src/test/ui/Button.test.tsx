import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/shared/ui/Button";

describe("Button", () => {
  it("renders as a button by default", () => {
    render(<Button>Start battle</Button>);

    const button = screen.getByRole("button", { name: "Start battle" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("rounded-full");
  });

  it("renders custom button type", () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button", { name: "Click me" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled button
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Disabled button" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders as a link when href is provided", () => {
    render(<Button href="/arena">Go to arena</Button>);

    const link = screen.getByRole("link", { name: "Go to arena" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/arena");
  });

  it("applies custom className", () => {
    render(<Button className="custom-button-class">Styled button</Button>);

    const button = screen.getByRole("button", { name: "Styled button" });

    expect(button).toHaveClass("custom-button-class");
  });

  it("uses different style classes for each variant", () => {
    const { rerender } = render(<Button>Primary button</Button>);
    const primaryClassName = screen.getByRole("button", {
      name: "Primary button",
    }).className;
    expect(primaryClassName).toContain("bg-blue-500");

    rerender(<Button variant="secondary">Secondary button</Button>);
    const secondaryClassName = screen.getByRole("button", {
      name: "Secondary button",
    }).className;
    expect(secondaryClassName).toContain("app-control-secondary-bg");

    rerender(<Button variant="ghost">Ghost button</Button>);
    const ghostClassName = screen.getByRole("button", { name: "Ghost button" }).className;
    expect(ghostClassName).toContain("app-control-ghost-text");

    expect(secondaryClassName).not.toBe(primaryClassName);
    expect(ghostClassName).not.toBe(primaryClassName);
    expect(ghostClassName).not.toBe(secondaryClassName);
  });
});
