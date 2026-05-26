import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { NotFoundPageView } from "@/views/not-found/ui/NotFoundPageView";

vi.mock("@/shared/ui/AmbientGrid", () => ({
  AmbientGrid: ({ className }: { className?: string }) => (
    <div data-testid="ambient-grid" className={className} />
  ),
}));

vi.mock("@/shared/ui/Container", () => ({
  Container: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({
    children,
    className,
    delay,
    variant,
  }: {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: string;
  }) => (
    <div
      data-testid="reveal"
      data-delay={delay ?? 0}
      data-variant={variant ?? ""}
      className={className}
    >
      {children}
    </div>
  ),
}));

vi.mock("@/views/not-found/ui/NotFoundActions", () => ({
  NotFoundActions: () => <div data-testid="not-found-actions">actions</div>,
}));

describe("views/not-found/ui/NotFoundPageView", () => {
  it("renders heading, status copy and actions", () => {
    render(<NotFoundPageView />);

    expect(screen.getByTestId("ambient-grid")).toBeInTheDocument();
    expect(screen.getByText("STATUS_NOT_FOUND")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByTestId("not-found-actions")).toBeInTheDocument();
    expect(screen.getByText(/error code:/i)).toBeInTheDocument();
    expect(screen.getByText("0x404")).toBeInTheDocument();
  });

  it("uses reveal wrappers with expected delays", () => {
    render(<NotFoundPageView />);

    const reveals = screen.getAllByTestId("reveal");
    expect(reveals.length).toBeGreaterThanOrEqual(5);

    expect(reveals.some((item) => item.getAttribute("data-variant") === "scale")).toBe(
      true,
    );
    expect(reveals.some((item) => item.getAttribute("data-delay") === "80")).toBe(true);
    expect(reveals.some((item) => item.getAttribute("data-delay") === "260")).toBe(true);
  });
});
