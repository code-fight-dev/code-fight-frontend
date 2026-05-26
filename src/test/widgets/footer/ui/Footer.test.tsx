import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockMatchMedia } from "@/test/helpers/matchMedia";
import { Footer } from "@/widgets/footer";

describe("Footer", () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it("renders footer brand, navigation links, copyright and social links", () => {
    render(<Footer />);

    expect(
      screen.getByText(
        "The definitive platform for competitive programming and elite technical assessment.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} Competitive Arena. All rights reserved.`,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("navigation", {
        name: "Footer social links",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /x \(opens in a new tab\)/i,
      }),
    ).toHaveAttribute("target", "_blank");

    expect(
      screen.getByRole("link", {
        name: /github \(opens in a new tab\)/i,
      }),
    ).toHaveAttribute("rel", "noopener noreferrer");
  });
});
