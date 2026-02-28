export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterSocialLink = {
  label: string;
  href: string;
  icon: "x" | "github";
};
