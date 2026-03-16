export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterSocialIcon = "x" | "github";

export type FooterSocialLink = Readonly<{
  label: string;
  href: `https://${string}`;
  icon: FooterSocialIcon;
}>;
