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
  });

  it("applies custom className", () => {
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
