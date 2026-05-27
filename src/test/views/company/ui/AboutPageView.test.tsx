import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AboutPageView } from "@/views/company/ui/AboutPageView";

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("views/company/ui/AboutPageView", () => {
  it("renders about page content and active company navigation", () => {
    render(<AboutPageView />);

    expect(
      screen.getByRole("heading", { name: "About CodeFight", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("heading", { name: "Why we started", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What we are building", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How we work", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What matters to us", level: 3 }),
    ).toBeInTheDocument();
  });
});
