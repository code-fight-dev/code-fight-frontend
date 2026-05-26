import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TopLanguages } from "@/views/viewer-profile/ui/TopLanguages";

describe("views/viewer-profile/ui/TopLanguages", () => {
  it("renders placeholder state when languages list is empty", () => {
    render(<TopLanguages languages={[]} />);

    expect(screen.getByRole("heading", { name: "Top Languages" })).toBeInTheDocument();
    expect(screen.getAllByText("Awaiting data")).toHaveLength(3);
    expect(
      screen.getByText(
        "Language stats will populate once solution history is available.",
      ),
    ).toBeInTheDocument();
  });

  it("renders language rows with percentages and minimum bar width", () => {
    const { container } = render(
      <TopLanguages
        languages={[
          { name: "TypeScript", usageShare: 0.71 },
          { name: "Rust", usageShare: 0.01 },
        ]}
      />,
    );

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("71%")).toBeInTheDocument();
    expect(screen.getByText("1%")).toBeInTheDocument();

    const styles = [...container.querySelectorAll("div[style]")].map((node) =>
      node.getAttribute("style"),
    );
    expect(styles).toContain("width: 71%;");
    expect(styles).toContain("width: 6%;");
  });
});
