"use client";

import {
  GOOGLE_RECAPTCHA_ACTION,
  GOOGLE_RECAPTCHA_SITE_KEY,
  IS_GOOGLE_RECAPTCHA_ENABLED,
} from "@/shared/config/recaptcha";

const RECAPTCHA_SCRIPT_ID = "codefight-google-recaptcha";
const RECAPTCHA_SCRIPT_LOAD_TIMEOUT_MS = 10_000;

type GrecaptchaApi = {
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  ready: (callback: () => void) => void;
};

let recaptchaScriptPromise: Promise<void> | null = null;

function getGrecaptchaApi() {
  if (typeof window === "undefined") {
    return null;
  }

  const globalWindow = window as Window & {
    grecaptcha?: GrecaptchaApi;
  };

  return globalWindow.grecaptcha ?? null;
}

function ensureRecaptchaScriptLoaded(siteKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("captcha verification is unavailable"));
  }

  if (getGrecaptchaApi()) {
    return Promise.resolve();
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise<void>((resolve, reject) => {
    const failScriptLoading = () => {
      recaptchaScriptPromise = null;
      reject(new Error("captcha verification is unavailable"));
    };

    const timeoutId = window.setTimeout(
      failScriptLoading,
      RECAPTCHA_SCRIPT_LOAD_TIMEOUT_MS,
    );

    const cleanup = () => {
      window.clearTimeout(timeoutId);
    };

    const resolveScript = () => {
      cleanup();
      resolve();
    };

    const rejectScript = () => {
      cleanup();
      failScriptLoading();
    };

    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);

    if (existingScript) {
      if (getGrecaptchaApi()) {
        resolveScript();
        return;
      }

      existingScript.addEventListener("load", resolveScript, { once: true });
      existingScript.addEventListener("error", rejectScript, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RECAPTCHA_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.onload = resolveScript;
    script.onerror = rejectScript;

    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
}

function waitForRecaptchaReady() {
  return new Promise<GrecaptchaApi>((resolve, reject) => {
    const recaptcha = getGrecaptchaApi();
    if (!recaptcha) {
      reject(new Error("captcha verification is unavailable"));
      return;
    }

    recaptcha.ready(() => {
      const readyRecaptcha = getGrecaptchaApi();
      if (!readyRecaptcha) {
        reject(new Error("captcha verification is unavailable"));
        return;
      }

      resolve(readyRecaptcha);
    });
  });
}

export function isPasswordResetRecaptchaEnabled() {
  return IS_GOOGLE_RECAPTCHA_ENABLED;
}

export async function executePasswordResetRecaptcha() {
  if (!IS_GOOGLE_RECAPTCHA_ENABLED) {
    return "";
  }

  await ensureRecaptchaScriptLoaded(GOOGLE_RECAPTCHA_SITE_KEY);
  const recaptcha = await waitForRecaptchaReady();
  const token = (
    await recaptcha.execute(GOOGLE_RECAPTCHA_SITE_KEY, {
      action: GOOGLE_RECAPTCHA_ACTION,
    })
  )?.trim();

  if (!token) {
    throw new Error("captcha verification failed");
  }

  return token;
}
