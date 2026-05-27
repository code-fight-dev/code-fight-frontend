import { describe, expect, it } from "vitest";

import { getPasswordRecoveryErrorMessage } from "@/features/password-recovery/model/errors";

describe("features/password-recovery/model/errors", () => {
  it.each([
    ["invalid input: valid email is required", "Enter a valid email address."],
    [
      "invalid input: reset code must be 6 digits",
      "Enter a valid 6-digit verification code.",
    ],
    [
      "invalid input: password must be between 8 and 72 characters",
      "Password must be between 8 and 72 characters.",
    ],
    ["captcha verification failed", "Captcha verification failed. Please try again."],
    [
      "captcha verification is unavailable",
      "Captcha verification is temporarily unavailable. Please try again.",
    ],
    ["password reset code is invalid", "Verification code is invalid. Please try again."],
    ["password reset code is expired", "Verification code expired. Request a new code."],
  ])("maps backend error '%s'", (message, expectedMessage) => {
    expect(getPasswordRecoveryErrorMessage(message)).toBe(expectedMessage);
  });

  it("falls back to generic message", () => {
    expect(getPasswordRecoveryErrorMessage("")).toBe(
      "Password recovery failed. Please try again.",
    );
  });
});
