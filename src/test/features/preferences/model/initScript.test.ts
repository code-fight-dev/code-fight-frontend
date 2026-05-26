import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPreferencesInitScript } from "@/features/preferences/model/initScript";
import {
  DEFAULT_PREFERENCES,
  MOTION_PREFERENCE_COOKIE_KEY,
  PREFERENCES_STORAGE_KEY,
  THEME_PREFERENCE_COOKIE_KEY,
} from "@/features/preferences/model/preferences";

function clearPreferenceCookies() {
  document.cookie = `${THEME_PREFERENCE_COOKIE_KEY}=; path=/; max-age=0`;
  document.cookie = `${MOTION_PREFERENCE_COOKIE_KEY}=; path=/; max-age=0`;
}

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

function runPreferencesInitScript() {
  const script = getPreferencesInitScript();
  const execute = new Function(script);
  execute();
}

describe("features/preferences/model/initScript", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: {
        protocol: "http:",
      },
      localStorage: createMemoryStorage(),
    } as unknown as Window & typeof globalThis);

    clearPreferenceCookies();
    document.documentElement.dataset.theme = "";
    document.documentElement.dataset.motion = "";
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns executable script content", () => {
    const script = getPreferencesInitScript();

    expect(script).toContain("window.localStorage.getItem");
    expect(script).toContain(PREFERENCES_STORAGE_KEY);
    expect(script).toContain(THEME_PREFERENCE_COOKIE_KEY);
    expect(script).toContain(MOTION_PREFERENCE_COOKIE_KEY);
  });

  it("applies valid localStorage preferences and syncs cookies", () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: "light",
        motion: "disabled",
      }),
    );

    runPreferencesInitScript();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.motion).toBe("disabled");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.cookie).toContain(`${THEME_PREFERENCE_COOKIE_KEY}=light`);
    expect(document.cookie).toContain(`${MOTION_PREFERENCE_COOKIE_KEY}=disabled`);
  });

  it("falls back to root dataset/default values when localStorage payload is invalid", () => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.motion = "disabled";
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, "{bad-json");

    runPreferencesInitScript();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.motion).toBe("disabled");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("normalizes invalid stored values via fallback theme and motion", () => {
    document.documentElement.dataset.theme = "unknown-theme";
    document.documentElement.dataset.motion = "unknown-motion";
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: "neon",
        motion: "turbo",
      }),
    );

    runPreferencesInitScript();

    expect(document.documentElement.dataset.theme).toBe(DEFAULT_PREFERENCES.theme);
    expect(document.documentElement.dataset.motion).toBe(DEFAULT_PREFERENCES.motion);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
