import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_PREFERENCES,
  MOTION_PREFERENCE_COOKIE_KEY,
  THEME_PREFERENCE_COOKIE_KEY,
} from "@/features/preferences/model/preferences";

const serverMocks = vi.hoisted(() => ({
  cookies: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: serverMocks.cookies,
}));

type CookieShape = { value: string };

function createCookieStore(values: Record<string, string | undefined>) {
  return {
    get: vi.fn((key: string): CookieShape | undefined => {
      const value = values[key];
      return value === undefined ? undefined : { value };
    }),
  };
}

async function importPreferencesServer() {
  vi.resetModules();
  return import("@/features/preferences/model/server");
}

describe("features/preferences/model/server", () => {
  beforeEach(() => {
    serverMocks.cookies.mockReset();
  });

  it("returns defaults when cookies are absent", async () => {
    const cookieStore = createCookieStore({});
    serverMocks.cookies.mockResolvedValue(cookieStore);

    const { getPreferencesServer } = await importPreferencesServer();
    const preferences = await getPreferencesServer();

    expect(preferences).toEqual(DEFAULT_PREFERENCES);
    expect(cookieStore.get).toHaveBeenCalledWith(THEME_PREFERENCE_COOKIE_KEY);
    expect(cookieStore.get).toHaveBeenCalledWith(MOTION_PREFERENCE_COOKIE_KEY);
  });

  it("reads and normalizes cookie values", async () => {
    const cookieStore = createCookieStore({
      [THEME_PREFERENCE_COOKIE_KEY]: "light",
      [MOTION_PREFERENCE_COOKIE_KEY]: "disabled",
    });
    serverMocks.cookies.mockResolvedValue(cookieStore);

    const { getPreferencesServer } = await importPreferencesServer();
    const preferences = await getPreferencesServer();

    expect(preferences).toEqual({
      ...DEFAULT_PREFERENCES,
      theme: "light",
      motion: "disabled",
    });
  });

  it("falls back to defaults for invalid cookie values", async () => {
    const cookieStore = createCookieStore({
      [THEME_PREFERENCE_COOKIE_KEY]: "unexpected-theme",
      [MOTION_PREFERENCE_COOKIE_KEY]: "unexpected-motion",
    });
    serverMocks.cookies.mockResolvedValue(cookieStore);

    const { getPreferencesServer } = await importPreferencesServer();
    const preferences = await getPreferencesServer();

    expect(preferences).toEqual(DEFAULT_PREFERENCES);
  });
});
