import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "@/shared/ui/BrandMark";

describe("BrandMark", () => {
  it("renders mark wrapper and icon", () => {
    const { container } = render(<BrandMark />);

    const root = container.firstElementChild;
    const svg = container.querySelector("svg");

    expect(root).toHaveClass("rounded-xl");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("merges wrapper and icon class names", () => {
    const { container } = render(
      <BrandMark className="wrapper-extra" iconClassName="icon-extra" />,
    );

    expect(container.firstElementChild).toHaveClass("wrapper-extra");
    expect(container.querySelector("svg")).toHaveClass("icon-extra");
  });
});
