import { afterEach, describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("blocks all crawlers outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.code-fight.com");

    const { default: robots } = await loadPageModule(() => import("@/app/robots"));

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });

  it("publishes production crawler rules with sitemap and host", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.code-fight.com/");

    const { default: robots } = await loadPageModule(() => import("@/app/robots"));

    expect(robots()).toEqual({
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/signin",
            "/signup",
            "/recovery",
            "/settings",
            "/arena/match",
            "/arena/replay",
          ],
        },
      ],
      sitemap: "https://www.code-fight.com/sitemap.xml",
      host: "https://www.code-fight.com",
    });
  });
});

describe("app/sitemap", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns static and challenge URLs when challenge list is available", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.code-fight.com");

    const getChallengesMock = vi.fn().mockResolvedValue({
      challenges: [
        {
          slug: "two-sum",
          createdAt: "2026-05-01T12:30:00.000Z",
        },
        {
          slug: "sql joins",
          createdAt: "invalid-date",
        },
      ],
    });

    const { default: sitemap } = await loadPageModule(
      () => import("@/app/sitemap"),
      () => {
        vi.doMock("@/entities/challenge/server", () => ({
          getChallenges: getChallengesMock,
        }));
      },
    );
    const entries = await sitemap();

    expect(getChallengesMock).toHaveBeenCalledTimes(1);
    expect(entries).toContainEqual({
      url: "https://www.code-fight.com/",
      changeFrequency: "daily",
      priority: 1,
    });
    expect(entries).toContainEqual({
      url: "https://www.code-fight.com/challenges/two-sum",
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: new Date("2026-05-01T12:30:00.000Z"),
    });
    expect(entries).toContainEqual({
      url: "https://www.code-fight.com/challenges/sql%20joins",
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: undefined,
    });
  });

  it("falls back to static URLs when challenge endpoint fails", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.code-fight.com");

    const getChallengesMock = vi.fn().mockRejectedValue(new Error("service down"));

    const { default: sitemap } = await loadPageModule(
      () => import("@/app/sitemap"),
      () => {
        vi.doMock("@/entities/challenge/server", () => ({
          getChallenges: getChallengesMock,
        }));
      },
    );
    const entries = await sitemap();

    expect(getChallengesMock).toHaveBeenCalledTimes(1);
    expect(entries).toContainEqual({
      url: "https://www.code-fight.com/challenges",
      changeFrequency: "daily",
      priority: 0.95,
    });
    expect(entries.some((entry) => entry.url.includes("/challenges/"))).toBe(false);
  });
});
