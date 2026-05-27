import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PrivacyPageView } from "@/views/company/ui/PrivacyPageView";

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("views/company/ui/PrivacyPageView", () => {
  it("renders privacy summary and policy sections", () => {
    render(<PrivacyPageView />);

    expect(
      screen.getByRole("heading", { name: "Privacy", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("heading", { name: "Summary", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Last updated: May 26, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Data we may process", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How we use it", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Third-party services", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your choices", level: 3 }),
    ).toBeInTheDocument();
  });
});
