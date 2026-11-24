export type HeaderNavItem = {
  label: string;
  href: string;
};

export const HEADER_NAV: HeaderNavItem[] = [
  { label: "Arena", href: "/arena" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Challenges", href: "/challenges" },
  { label: "Documentation", href: "/docs" },
];
