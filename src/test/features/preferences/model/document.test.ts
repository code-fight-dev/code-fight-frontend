import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyPreferencesToDocument,
  persistPreferences,
  readPreferencesFromDocument,
  readPreferencesFromStorage,
} from "@/features/preferences/model/document";
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

describe("features/preferences/model/document", () => {
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
    clearPreferenceCookies();
  });

  it("applies preferences to document root and color scheme", () => {
    applyPreferencesToDocument({
      ...DEFAULT_PREFERENCES,
      theme: "light",
      motion: "disabled",
    });

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.dataset.motion).toBe("disabled");
    expect(document.documentElement.style.colorScheme).toBe("light");

    applyPreferencesToDocument(DEFAULT_PREFERENCES);
    expect(document.documentElement.dataset.theme).toBe("default");
    expect(document.documentElement.dataset.motion).toBe("enabled");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("reads and normalizes preferences from document dataset", () => {
    document.documentElement.dataset.theme = "unexpected";
    document.documentElement.dataset.motion = "disabled";

    expect(readPreferencesFromDocument()).toEqual({
      ...DEFAULT_PREFERENCES,
      theme: "default",
      motion: "disabled",
    });
  });

  it("reads preferences from storage and falls back when storage content is invalid", () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: "light",
        motion: "disabled",
        editor: {
          ...DEFAULT_PREFERENCES.editor,
          fontSize: 18,
        },
      }),
    );

    expect(readPreferencesFromStorage()).toEqual({
      ...DEFAULT_PREFERENCES,
      theme: "light",
      motion: "disabled",
      editor: {
        ...DEFAULT_PREFERENCES.editor,
        fontSize: 18,
      },
    });

    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, "{bad-json");
    expect(readPreferencesFromStorage()).toEqual(DEFAULT_PREFERENCES);

    window.localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    expect(readPreferencesFromStorage()).toEqual(DEFAULT_PREFERENCES);
  });

  it("persists preferences to localStorage and cookies", () => {
    persistPreferences({
      ...DEFAULT_PREFERENCES,
      theme: "light",
      motion: "disabled",
    });

    expect(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)).toBe(
      JSON.stringify({
        ...DEFAULT_PREFERENCES,
        theme: "light",
        motion: "disabled",
      }),
    );
    expect(document.cookie).toContain(`${THEME_PREFERENCE_COOKIE_KEY}=light`);
    expect(document.cookie).toContain(`${MOTION_PREFERENCE_COOKIE_KEY}=disabled`);
  });

  it("persists preferences with secure cookies for https protocol", () => {
    vi.stubGlobal("window", {
      location: {
        protocol: "https:",
      },
      localStorage: createMemoryStorage(),
    } as unknown as Window & typeof globalThis);

    persistPreferences(DEFAULT_PREFERENCES);

    expect(document.cookie).toContain(`${THEME_PREFERENCE_COOKIE_KEY}=default`);
    expect(document.cookie).toContain(`${MOTION_PREFERENCE_COOKIE_KEY}=enabled`);
  });

  it("is safe for SSR-like environment without document/window", () => {
    vi.stubGlobal("document", undefined);
    vi.stubGlobal("window", undefined);

    expect(() => applyPreferencesToDocument(DEFAULT_PREFERENCES)).not.toThrow();
    expect(readPreferencesFromDocument()).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferencesFromStorage()).toEqual(DEFAULT_PREFERENCES);
    expect(() => persistPreferences(DEFAULT_PREFERENCES)).not.toThrow();
  });
});
