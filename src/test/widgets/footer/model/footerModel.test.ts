import { describe, expect, it } from "vitest";

import { FOOTER_COLUMNS, FOOTER_SOCIAL_LINKS } from "@/widgets/footer/testing";

describe("widgets/footer/model", () => {
  it("defines footer columns with expected navigation groups", () => {
    expect(FOOTER_COLUMNS.map((column) => column.title)).toEqual([
      "Platform",
      "Developers",
      "Company",
    ]);

    const links = FOOTER_COLUMNS.flatMap((column) => column.links);
    expect(links).toHaveLength(10);
    expect(links.every((link) => link.href.startsWith("/"))).toBe(true);

    expect(FOOTER_COLUMNS[0]?.links).toEqual([
      { label: "Global Arena", href: "/arena" },
      { label: "Challenges", href: "/challenges" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Leaderboards", href: "/leaderboard" },
    ]);
  });

  it("defines social links with secure external urls and supported icons", () => {
    expect(FOOTER_SOCIAL_LINKS).toEqual([
      { label: "X", href: "https://x.com", icon: "x" },
      {
        label: "GitHub",
        href: "https://github.com/zhbforum/code-fight-frontend",
        icon: "github",
      },
    ]);

    expect(FOOTER_SOCIAL_LINKS.every((link) => link.href.startsWith("https://"))).toBe(
      true,
    );
  });
});
