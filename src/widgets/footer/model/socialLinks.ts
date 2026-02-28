export type FooterSocialLink = {
  label: string;
  href: string;
  icon: "x" | "github";
};

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { label: "Twitter", href: "https://twitter.com", icon: "x" },
  {
    label: "GitHub",
    href: "https://github.com/zhbforum/code-fight-frontend",
    icon: "github",
  },
];
