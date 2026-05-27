const DEFAULT_RECAPTCHA_ACTION = "password_reset";

const rawSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;
const rawAction = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_ACTION;

export const GOOGLE_RECAPTCHA_SITE_KEY = rawSiteKey?.trim() ?? "";
export const GOOGLE_RECAPTCHA_ACTION = rawAction?.trim() || DEFAULT_RECAPTCHA_ACTION;

export const IS_GOOGLE_RECAPTCHA_ENABLED = GOOGLE_RECAPTCHA_SITE_KEY !== "";
