import type { FooterColumn } from "./types";

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "Global Arena", href: "/arena" },
      { label: "Challenges", href: "/challenges" },
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
