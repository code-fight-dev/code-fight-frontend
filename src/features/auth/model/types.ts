export type AuthMode = "signin" | "signup";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  username: string;
  email: string;
  password: string;
};

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
  mode: AuthMode;
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
