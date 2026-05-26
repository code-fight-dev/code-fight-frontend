import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AmbientGrid } from "@/shared/ui/AmbientGrid";

describe("AmbientGrid", () => {
  it("renders decorative grid layer with aria-hidden", () => {
    const { container } = render(<AmbientGrid />);

    const grid = container.firstElementChild;
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("aria-hidden", "true");
    expect(grid).toHaveClass("pointer-events-none");
  });

  it("merges custom className", () => {
    const { container } = render(<AmbientGrid className="custom-grid-class" />);

    expect(container.firstElementChild).toHaveClass("custom-grid-class");
  });
});
