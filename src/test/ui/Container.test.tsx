import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "@/shared/ui/Container";

describe("Container", () => {
  it("renders children", () => {
    render(
      <Container>
        <p>Page content</p>
      </Container>,
    );

    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("applies base layout classes", () => {
    render(
      <Container>
        <p>Content</p>
      </Container>,
    );

    const container = screen.getByText("Content").parentElement;

    expect(container).toHaveClass("mx-auto");
    expect(container).toHaveClass("w-full");
    expect(container).toHaveClass("max-w-420");
    expect(container).toHaveClass("px-4");
    expect(container).toHaveClass("sm:px-6");
    expect(container).toHaveClass("md:px-8");
    expect(container).toHaveClass("xl:px-10");
    expect(container).toHaveClass("2xl:max-w-470");
    expect(container).toHaveClass("2xl:px-12");
  });

  it("merges custom className with base classes", () => {
    render(
      <Container className="custom-container-class">
        <p>Content</p>
      </Container>,
    );

    const container = screen.getByText("Content").parentElement;

    expect(container).toHaveClass("custom-container-class");
    expect(container).toHaveClass("mx-auto");
    expect(container).toHaveClass("w-full");
  });
});
