import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { CompanyPageShell } from "@/views/company/ui/CompanyPageShell";

vi.mock("@/shared/ui/Reveal", () => ({
  Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="mock-reveal" className={className}>
      {children}
    </div>
  ),
}));

describe("views/company/ui/CompanyPageShell", () => {
  it("renders shell content, active nav item, and custom children", () => {
    render(
      <CompanyPageShell
        activePage="contact"
        kicker="Company"
        title="Contact"
        description="Test description for company shell."
      >
        <div data-testid="shell-children">children-content</div>
      </CompanyPageShell>,
    );

    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Contact", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Test description for company shell.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Built in Public", level: 2 }),
    ).toBeInTheDocument();

    const aboutLink = screen.getByRole("link", { name: "About" });
    const contactLink = screen.getByRole("link", { name: "Contact" });
    const privacyLink = screen.getByRole("link", { name: "Privacy" });

    expect(aboutLink).toHaveAttribute("href", "/about");
    expect(contactLink).toHaveAttribute("href", "/contact");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(aboutLink).not.toHaveAttribute("aria-current");
    expect(contactLink).toHaveAttribute("aria-current", "page");
    expect(privacyLink).not.toHaveAttribute("aria-current");

    const githubLink = screen.getByRole("link", {
      name: "Visit GitHub Organization",
    });
    expect(githubLink).toHaveAttribute("href", "https://github.com/code-fight-dev");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    expect(screen.getByTestId("shell-children")).toHaveTextContent("children-content");
  });
});
