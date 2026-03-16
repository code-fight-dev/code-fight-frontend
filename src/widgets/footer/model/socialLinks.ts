import type { FooterSocialLink } from "./types";

export const FOOTER_SOCIAL_LINKS = [
  { label: "X", href: "https://x.com", icon: "x" },
  {
    label: "GitHub",
    href: "https://github.com/zhbforum/code-fight-frontend",
    icon: "github",
  },
] as const satisfies readonly FooterSocialLink[];
