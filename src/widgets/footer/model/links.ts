export type FooterLink = { label: string; href: string };

export const FOOTER_COLUMNS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Platform",
    links: [
      { label: "Global Arena", href: "/arena" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Leaderboards", href: "/leaderboard" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Status", href: "/status" },
      { label: "Open Source", href: "/open-source" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];
