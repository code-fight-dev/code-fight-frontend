import type { MetadataRoute } from "next";
import { SITE_ORIGIN, SITE_URL } from "@/shared/config/seo";

const isIndexingEnabled = process.env.SITE_INDEXING_ENABLED === "true";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_ORIGIN,
  };
}
