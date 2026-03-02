export function getOAuthErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case "oauth_provider_invalid":
      return "The selected OAuth provider is not supported.";
    case "oauth_provider_unavailable":
      return "This OAuth provider is not configured yet.";
    case "oauth_start_failed":
      return "Could not start OAuth authentication. Please try again.";
    case "oauth_state_invalid":
      return "The OAuth session expired. Please try again.";
    case "oauth_code_missing":
      return "The OAuth provider did not return a valid authorization code.";
    case "oauth_exchange_failed":
      return "Could not complete OAuth authentication. Please try again.";
    case "oauth_email_required":
      return "Your OAuth account must expose a verified email address.";
    case "oauth_auth_failed":
      return "Could not sign you in with that provider.";
    default:
      return null;
  }
}

export function getAuthSubmitErrorMessage(message: string) {
  switch (message) {
    case "email already in use":
      return "This email is already registered.";
    case "username already in use":
      return "This username is already taken.";
    case "invalid credentials":
      return "Email or password is incorrect.";
    default:
      return message || "Authentication failed. Please try again.";
  }
}
