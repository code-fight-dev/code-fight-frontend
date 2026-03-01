export type AuthFieldConfig = {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password";
  icon: "username" | "email" | "password";
  autoComplete?: string;
  auxiliaryLink?: {
    label: string;
    href: string;
  };
  allowReveal?: boolean;
};

export type AuthTermsConfig = {
  serviceLabel: string;
  serviceHref: string;
  privacyLabel: string;
  privacyHref: string;
};

export type AuthPageConfig = {
  mode: "signin" | "signup";
  layout: "card" | "stacked";
  title: string;
  description: string;
  dividerLabel: string;
  submitLabel: string;
  fields: AuthFieldConfig[];
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  terms?: AuthTermsConfig;
};
