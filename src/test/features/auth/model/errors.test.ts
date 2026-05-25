import { describe, expect, it } from "vitest";

import {
  getAuthSubmitErrorMessage,
  getOAuthErrorMessage,
} from "@/features/auth/model/errors";

describe("features/auth/model/errors", () => {
  it.each([
    ["oauth_provider_invalid", "The selected OAuth provider is not supported."],
    ["oauth_provider_unavailable", "This OAuth provider is not configured yet."],
    ["oauth_start_failed", "Could not start OAuth authentication. Please try again."],
    ["oauth_state_invalid", "The OAuth session expired. Please try again."],
    [
      "oauth_code_missing",
      "The OAuth provider did not return a valid authorization code.",
    ],
    [
      "oauth_exchange_failed",
      "Could not complete OAuth authentication. Please try again.",
    ],
    ["oauth_email_required", "Your OAuth account must expose a verified email address."],
    ["oauth_auth_failed", "Could not sign you in with that provider."],
  ])("maps oauth error code %s", (errorCode, expectedMessage) => {
    expect(getOAuthErrorMessage(errorCode)).toBe(expectedMessage);
  });

  it("returns null for unknown oauth error code", () => {
    expect(getOAuthErrorMessage("unknown_code")).toBeNull();
    expect(getOAuthErrorMessage(null)).toBeNull();
  });

  it.each([
    ["email already in use", "This email is already registered."],
    ["username already in use", "This username is already taken."],
    ["invalid credentials", "Email or password is incorrect."],
  ])("maps submit error message %s", (errorMessage, expectedMessage) => {
    expect(getAuthSubmitErrorMessage(errorMessage)).toBe(expectedMessage);
  });

  it("returns original message when it is not mapped", () => {
    expect(getAuthSubmitErrorMessage("Service unavailable")).toBe("Service unavailable");
  });

  it("returns default fallback when message is empty", () => {
    expect(getAuthSubmitErrorMessage("")).toBe(
      "Authentication failed. Please try again.",
    );
  });
});
