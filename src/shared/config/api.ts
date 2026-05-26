const DEFAULT_API_BASE_URL = "https://api.code-fight.com";

function normalizeApiBaseUrl(value: string | undefined) {
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

const publicApiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
const internalApiBaseUrl = normalizeApiBaseUrl(process.env.INTERNAL_API_BASE_URL);

export const API_BASE_URL =
  typeof window === "undefined"
    ? internalApiBaseUrl || publicApiBaseUrl || DEFAULT_API_BASE_URL
    : publicApiBaseUrl || DEFAULT_API_BASE_URL;
