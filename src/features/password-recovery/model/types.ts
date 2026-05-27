export type PasswordRecoveryStep = "email" | "verify" | "password" | "success";

export type PasswordChecks = {
  minLength: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
  passwordsMatch: boolean;
};
