import { afterEach, describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("blocks all crawlers when indexing is disabled", async () => {
    vi.stubEnv("SITE_INDEXING_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.code-fight.com");

    const { default: robots } = await loadPageModule(() => import("@/app/robots"));

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
  });

  it("publishes crawler rules with sitemap and host when indexing is enabled", async () => {
    vi.stubEnv("SITE_INDEXING_ENABLED", "true");
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
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("builds sitemap entries for static routes and challenges", async () => {
    const getChallengesMock = vi.fn().mockResolvedValue({
      challenges: [
        {
          slug: "two sum",
          createdAt: "2026-05-01T10:00:00.000Z",
        },
        {
          slug: "broken-date",
          createdAt: "not-a-date",
        },
      ],
    });

    const { default: sitemap } = await loadPageModule(
      () => import("@/app/sitemap"),
      () => {
        vi.doMock("@/entities/challenge/server", () => ({
          getChallenges: getChallengesMock,
        }));
        vi.doMock("@/shared/config/seo", () => ({
          SITE_URL: "https://code-fight.test",
        }));
      },
    );

    const entries = await sitemap();
    const firstChallengeEntry = entries.find(
      (entry) => entry.url === "https://code-fight.test/challenges/two%20sum",
    );
    const secondChallengeEntry = entries.find(
      (entry) => entry.url === "https://code-fight.test/challenges/broken-date",
    );

    expect(getChallengesMock).toHaveBeenCalledTimes(1);
    expect(entries).toHaveLength(12);
    expect(entries).toContainEqual({
      url: "https://code-fight.test/",
      changeFrequency: "daily",
      priority: 1,
    });
    expect(firstChallengeEntry).toEqual({
      url: "https://code-fight.test/challenges/two%20sum",
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: new Date("2026-05-01T10:00:00.000Z"),
    });
    expect(secondChallengeEntry?.lastModified).toBeUndefined();
  });

  it("returns static sitemap routes when challenge loading fails", async () => {
    const getChallengesMock = vi.fn().mockRejectedValue(new Error("api unavailable"));

    const { default: sitemap } = await loadPageModule(
      () => import("@/app/sitemap"),
      () => {
        vi.doMock("@/entities/challenge/server", () => ({
          getChallenges: getChallengesMock,
        }));
        vi.doMock("@/shared/config/seo", () => ({
          SITE_URL: "https://code-fight.test",
        }));
      },
    );

    await expect(sitemap()).resolves.toEqual([
      {
        url: "https://code-fight.test/",
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: "https://code-fight.test/challenges",
        changeFrequency: "daily",
        priority: 0.95,
      },
      {
        url: "https://code-fight.test/arena",
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: "https://code-fight.test/leaderboard",
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: "https://code-fight.test/ranking",
        changeFrequency: "weekly",
        priority: 0.75,
      },
      {
        url: "https://code-fight.test/docs",
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: "https://code-fight.test/status",
        changeFrequency: "daily",
        priority: 0.7,
      },
      {
        url: "https://code-fight.test/about",
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: "https://code-fight.test/privacy",
        changeFrequency: "yearly",
        priority: 0.4,
      },
      {
        url: "https://code-fight.test/contact",
        changeFrequency: "yearly",
        priority: 0.4,
      },
    ]);
    expect(getChallengesMock).toHaveBeenCalledTimes(1);
  });
});
