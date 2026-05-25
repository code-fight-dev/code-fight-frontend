import { describe, expect, it } from "vitest";

import { SIGN_IN_AUTH_PAGE, SIGN_UP_AUTH_PAGE } from "@/features/auth/model/config";

describe("features/auth/model/config", () => {
  it("defines sign in auth page contract", () => {
    expect(SIGN_IN_AUTH_PAGE).toMatchObject({
      mode: "signin",
      layout: "card",
      title: "Welcome back",
      submitLabel: "Sign In",
      footerLinkHref: "/signup",
    });
    expect(SIGN_IN_AUTH_PAGE.fields.map((field) => field.id)).toEqual([
      "email",
      "password",
    ]);
    expect(SIGN_IN_AUTH_PAGE.fields[1]).toMatchObject({
      type: "password",
      allowReveal: true,
      auxiliaryLink: {
        label: "Forgot password?",
        href: "/recovery",
      },
    });
  });

  it("defines sign up auth page contract with terms", () => {
    expect(SIGN_UP_AUTH_PAGE).toMatchObject({
      mode: "signup",
      layout: "card",
      title: "Join the Arena",
      submitLabel: "Create Account",
      footerLinkHref: "/signin",
      terms: {
        serviceLabel: "Terms of Service",
        serviceHref: "/terms",
        privacyLabel: "Privacy Policy",
        privacyHref: "/privacy",
      },
    });
    expect(SIGN_UP_AUTH_PAGE.fields.map((field) => field.id)).toEqual([
      "username",
      "email",
      "password",
    ]);
    expect(SIGN_UP_AUTH_PAGE.fields[2]).toMatchObject({
      type: "password",
      allowReveal: true,
    });
  });
});
