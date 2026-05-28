import { afterEach, describe, expect, it, vi } from "vitest";

const DEFAULT_SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://code-fight.com"
    : "http://localhost:3000";

async function importSeoConfig() {
  vi.resetModules();

  return import("@/shared/config/seo");
}

describe("SITE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses default site URL when env values are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", "");

    const { SITE_URL, SITE_ORIGIN } = await importSeoConfig();

    expect(SITE_URL).toBe(DEFAULT_SITE_URL);
    expect(SITE_ORIGIN).toBe(new URL(DEFAULT_SITE_URL).origin);
  });

  it("uses normalized NEXT_PUBLIC_SITE_URL when provided", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SITE_URL",
      " https://www.code-fight.com/app/?utm_source=seo#section ",
    );
    vi.stubEnv("SITE_URL", "https://internal.code-fight.com");

    const { SITE_URL, SITE_ORIGIN } = await importSeoConfig();

    expect(SITE_URL).toBe("https://www.code-fight.com/app");
    expect(SITE_ORIGIN).toBe("https://www.code-fight.com");
  });

  it("falls back to normalized SITE_URL when public value is invalid", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not-a-valid-url");
    vi.stubEnv("SITE_URL", "https://code-fight.com/");

    const { SITE_URL } = await importSeoConfig();

    expect(SITE_URL).toBe("https://code-fight.com");
  });

  it("falls back to default value for non-http protocols", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "ftp://code-fight.com");
    vi.stubEnv("SITE_URL", "mailto:team@code-fight.com");

    const { SITE_URL } = await importSeoConfig();

    expect(SITE_URL).toBe(DEFAULT_SITE_URL);
  });
});
