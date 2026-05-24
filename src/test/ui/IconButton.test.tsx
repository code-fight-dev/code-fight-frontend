import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "@/shared/ui/IconButton";

describe("IconButton", () => {
  it("renders as a button by default", () => {
    render(<IconButton aria-label="Open menu" />);

    const button = screen.getByRole("button", { name: "Open menu" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("rounded-full");
  });

  it("renders children inside the button", () => {
    render(
      <IconButton aria-label="Open menu">
        <span data-testid="icon">*</span>
      </IconButton>,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders custom button type", () => {
    render(<IconButton aria-label="Submit icon button" type="submit" />);

    expect(screen.getByRole("button", { name: "Submit icon button" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<IconButton aria-label="Click icon button" onClick={handleClick} />);

    await user.click(screen.getByRole("button", { name: "Click icon button" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <IconButton aria-label="Disabled icon button" disabled onClick={handleClick} />,
    );

    await user.click(screen.getByRole("button", { name: "Disabled icon button" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders as a link when href is provided", () => {
    render(<IconButton aria-label="Go to arena" href="/arena" />);

    const link = screen.getByRole("link", { name: "Go to arena" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/arena");
  });

  it("renders children inside the link", () => {
    render(
      <IconButton aria-label="Go to arena" href="/arena">
        <span data-testid="icon">*</span>
      </IconButton>,
    );

    expect(screen.getByRole("link", { name: "Go to arena" })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <IconButton aria-label="Styled icon button" className="custom-icon-button-class" />,
    );

    const button = screen.getByRole("button", {
      name: "Styled icon button",
    });

    expect(button).toHaveClass("custom-icon-button-class");
  });
});
