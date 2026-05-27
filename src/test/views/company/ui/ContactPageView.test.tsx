import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { ContactPageView } from "@/views/company/ui/ContactPageView";

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("views/company/ui/ContactPageView", () => {
  it("renders contact page sections and github actions", () => {
    render(<ContactPageView />);

    expect(
      screen.getByRole("heading", { name: "Contact", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("heading", { name: "Reach us on GitHub", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bug Reports", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Feature Ideas", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Collaboration", level: 3 }),
    ).toBeInTheDocument();

    const openOrganizationLink = screen.getByRole("link", { name: "Open Organization" });
    expect(openOrganizationLink).toHaveAttribute(
      "href",
      "https://github.com/code-fight-dev",
    );
    expect(openOrganizationLink).toHaveAttribute("target", "_blank");
    expect(openOrganizationLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
