import type { MetadataRoute } from "next";
import { getChallenges } from "@/entities/challenge/server";
import { SITE_URL } from "@/shared/config/seo";

type SitemapEntry = MetadataRoute.Sitemap[number];

type StaticRouteConfig = {
  path: string;
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>;
  priority: number;
};

const STATIC_ROUTES: StaticRouteConfig[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/challenges", changeFrequency: "daily", priority: 0.95 },
  { path: "/arena", changeFrequency: "daily", priority: 0.9 },
  { path: "/leaderboard", changeFrequency: "hourly", priority: 0.9 },
  { path: "/ranking", changeFrequency: "weekly", priority: 0.75 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/status", changeFrequency: "daily", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
];

function buildAbsoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname}`;
}

function parseOptionalDate(value: string): Date | undefined {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function createStaticEntry(route: StaticRouteConfig): SitemapEntry {
  return {
    url: buildAbsoluteUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(createStaticEntry);

  try {
    const { challenges } = await getChallenges();

    for (const challenge of challenges) {
      entries.push({
        url: buildAbsoluteUrl(`/challenges/${encodeURIComponent(challenge.slug)}`),
        changeFrequency: "weekly",
        priority: 0.8,
        lastModified: parseOptionalDate(challenge.createdAt),
      });
    }
  } catch {
    // Keep sitemap available even if challenge API is temporarily unavailable.
  }

  return entries;
}
