import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DocsQuickLink } from "@/views/docs/model/types";
import { DocsQuickLinksPanel } from "@/views/docs/ui/DocsQuickLinksPanel";

describe("views/docs/ui/DocsQuickLinksPanel", () => {
  it("renders quick links navigation title", () => {
    render(<DocsQuickLinksPanel links={[]} />);

    expect(screen.getByText("On this page")).toBeTruthy();
    expect(screen.getByRole("navigation")).toBeTruthy();
  });

  it("renders all provided quick links", () => {
    const links: DocsQuickLink[] = [
      { href: "#getting-started", label: "Getting started" },
      { href: "#api-reference", label: "API reference" },
      { href: "#faq", label: "FAQ" },
    ];

    render(<DocsQuickLinksPanel links={links} />);

    const renderedLinks = screen.getAllByRole("link");

    expect(renderedLinks).toHaveLength(3);

    expect(screen.getByRole("link", { name: "Getting started" })).toHaveAttribute(
      "href",
      "#getting-started",
    );

    expect(screen.getByRole("link", { name: "API reference" })).toHaveAttribute(
      "href",
      "#api-reference",
    );

    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "#faq");
  });
});
