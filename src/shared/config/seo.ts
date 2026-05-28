const DEFAULT_SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://code-fight.com"
    : "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    url.search = "";

    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return null;
  }
}

const publicSiteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const privateSiteUrl = normalizeSiteUrl(process.env.SITE_URL);

export const SITE_URL = publicSiteUrl || privateSiteUrl || DEFAULT_SITE_URL;
export const SITE_ORIGIN = new URL(SITE_URL).origin;
