export function getPasswordRecoveryErrorMessage(message: string) {
  switch (message) {
    case "invalid input: valid email is required":
      return "Enter a valid email address.";
    case "invalid input: reset code must be 6 digits":
      return "Enter a valid 6-digit verification code.";
    case "invalid input: password must be between 8 and 72 characters":
      return "Password must be between 8 and 72 characters.";
    case "captcha verification failed":
      return "Captcha verification failed. Please try again.";
    case "captcha verification is unavailable":
      return "Captcha verification is temporarily unavailable. Please try again.";
    case "password reset code is invalid":
      return "Verification code is invalid. Please try again.";
    case "password reset code is expired":
      return "Verification code expired. Request a new code.";
    default:
      return message || "Password recovery failed. Please try again.";
  }
}
