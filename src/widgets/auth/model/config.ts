import type { AuthPageConfig } from "./types";

export const SIGN_IN_AUTH_PAGE: AuthPageConfig = {
  mode: "signin",
  layout: "card",
  title: "Welcome back",
  description: "Enter your credentials to access the Arena.",
  dividerLabel: "or continue with email",
  submitLabel: "Sign In",
  fields: [
    {
      id: "email",
      label: "Email address",
      placeholder: "name@example.com",
      type: "email",
      icon: "email",
      autoComplete: "email",
    },
    {
      id: "password",
      label: "Password",
      placeholder: "Enter your password",
      type: "password",
      icon: "password",
      autoComplete: "current-password",
      auxiliaryLink: {
        label: "Forgot password?",
        href: "/recovery",
      },
      allowReveal: true,
    },
  ],
  footerPrompt: "Don't have an account?",
  footerLinkLabel: "Sign up",
  footerLinkHref: "/signup",
};

export const SIGN_UP_AUTH_PAGE: AuthPageConfig = {
  mode: "signup",
  layout: "card",
  title: "Join the Arena",
  description: "Step into the high-stakes world of professional PvP coding.",
  dividerLabel: "or register manually",
  submitLabel: "Create Account",
  fields: [
    {
      id: "username",
      label: "Username",
      placeholder: "@coder_01",
      type: "text",
      icon: "username",
      autoComplete: "username",
    },
    {
      id: "email",
      label: "Email address",
      placeholder: "name@example.com",
      type: "email",
      icon: "email",
      autoComplete: "email",
    },
    {
      id: "password",
      label: "Password",
      placeholder: "Create a secure password",
      type: "password",
      icon: "password",
      autoComplete: "new-password",
      allowReveal: true,
    },
  ],
  terms: {
    serviceLabel: "Terms of Service",
    serviceHref: "/terms",
    privacyLabel: "Privacy Policy",
    privacyHref: "/privacy",
  },
  footerPrompt: "Already have an account?",
  footerLinkLabel: "Log in",
  footerLinkHref: "/signin",
};
