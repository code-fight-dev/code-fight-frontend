import { afterEach, describe, expect, it, vi } from "vitest";

const RECAPTCHA_SCRIPT_ID = "codefight-google-recaptcha";

type RecaptchaModule = {
  executePasswordResetRecaptcha: () => Promise<string>;
  isPasswordResetRecaptchaEnabled: () => boolean;
};

type GrecaptchaLike = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

function setGrecaptcha(value?: GrecaptchaLike) {
  const globalWindow = window as Window & {
    grecaptcha?: GrecaptchaLike;
  };

  if (value) {
    globalWindow.grecaptcha = value;
    return;
  }

  delete globalWindow.grecaptcha;
}

async function importRecaptchaModule(): Promise<RecaptchaModule> {
  vi.resetModules();
  return import("@/features/password-recovery/model/recaptcha");
}

describe("features/password-recovery/model/recaptcha", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
    setGrecaptcha();

    document.getElementById(RECAPTCHA_SCRIPT_ID)?.remove();
  });

  it("reports disabled state and skips captcha execution when site key is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "");

    const { executePasswordResetRecaptcha, isPasswordResetRecaptchaEnabled } =
      await importRecaptchaModule();

    await expect(executePasswordResetRecaptcha()).resolves.toBe("");
    expect(isPasswordResetRecaptchaEnabled()).toBe(false);
    expect(document.getElementById(RECAPTCHA_SCRIPT_ID)).toBeNull();
  });

  it("uses existing grecaptcha API and trims returned token", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "public-site-key");
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_ACTION", "password_reset_custom");

    const executeMock = vi.fn().mockResolvedValue("  token-from-google  ");
    const readyMock = vi.fn((callback: () => void) => callback());
    setGrecaptcha({
      ready: readyMock,
      execute: executeMock,
    });

    const { executePasswordResetRecaptcha, isPasswordResetRecaptchaEnabled } =
      await importRecaptchaModule();

    await expect(executePasswordResetRecaptcha()).resolves.toBe("token-from-google");
    expect(isPasswordResetRecaptchaEnabled()).toBe(true);
    expect(readyMock).toHaveBeenCalledTimes(1);
    expect(executeMock).toHaveBeenCalledWith("public-site-key", {
      action: "password_reset_custom",
    });
    expect(document.getElementById(RECAPTCHA_SCRIPT_ID)).toBeNull();
  });

  it("injects recaptcha script and executes token flow after script load", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "frontend-site-key");

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();

    const executionPromise = executePasswordResetRecaptcha();

    const script = document.getElementById(
      RECAPTCHA_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain(
      "https://www.google.com/recaptcha/api.js?render=frontend-site-key",
    );

    const executeMock = vi.fn().mockResolvedValue("captcha-token");
    setGrecaptcha({
      ready: (callback) => callback(),
      execute: executeMock,
    });

    script?.onload?.(new Event("load"));

    await expect(executionPromise).resolves.toBe("captcha-token");
    expect(executeMock).toHaveBeenCalledWith("frontend-site-key", {
      action: "password_reset",
    });
  });

  it("waits for existing recaptcha script load event", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "existing-script-key");

    const existingScript = document.createElement("script");
    existingScript.id = RECAPTCHA_SCRIPT_ID;
    document.head.appendChild(existingScript);

    const executeMock = vi.fn().mockResolvedValue("existing-script-token");

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();
    const executionPromise = executePasswordResetRecaptcha();

    setGrecaptcha({
      ready: (callback) => callback(),
      execute: executeMock,
    });

    existingScript.dispatchEvent(new Event("load"));

    await expect(executionPromise).resolves.toBe("existing-script-token");
    expect(executeMock).toHaveBeenCalledTimes(1);
  });

  it("fails when newly injected recaptcha script cannot be loaded", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "broken-script-key");

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();
    const executionPromise = executePasswordResetRecaptcha();

    const script = document.getElementById(
      RECAPTCHA_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    expect(script).not.toBeNull();

    script?.onerror?.(new Event("error"));

    await expect(executionPromise).rejects.toThrow("captcha verification is unavailable");
  });

  it("fails when existing recaptcha script emits an error event", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "existing-error-key");

    const existingScript = document.createElement("script");
    existingScript.id = RECAPTCHA_SCRIPT_ID;
    document.head.appendChild(existingScript);

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();
    const executionPromise = executePasswordResetRecaptcha();

    existingScript.dispatchEvent(new Event("error"));

    await expect(executionPromise).rejects.toThrow("captcha verification is unavailable");
  });

  it("fails when existing recaptcha script never loads", async () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "stale-script-key");

    const existingScript = document.createElement("script");
    existingScript.id = RECAPTCHA_SCRIPT_ID;
    document.head.appendChild(existingScript);

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();

    const executionPromise = expect(executePasswordResetRecaptcha()).rejects.toThrow(
      "captcha verification is unavailable",
    );

    await vi.advanceTimersByTimeAsync(10_000);

    await executionPromise;
  });

  it("fails when token is empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "empty-token-key");

    setGrecaptcha({
      ready: (callback) => callback(),
      execute: vi.fn().mockResolvedValue("   "),
    });

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();

    await expect(executePasswordResetRecaptcha()).rejects.toThrow(
      "captcha verification failed",
    );
  });

  it("fails when grecaptcha becomes unavailable by ready stage", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY", "ready-stage-key");

    setGrecaptcha({
      ready: (callback) => {
        setGrecaptcha();
        callback();
      },
      execute: vi.fn().mockResolvedValue("unused"),
    });

    const { executePasswordResetRecaptcha } = await importRecaptchaModule();

    await expect(executePasswordResetRecaptcha()).rejects.toThrow(
      "captcha verification is unavailable",
    );
  });
});
