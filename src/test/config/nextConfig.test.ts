import { afterEach, describe, expect, it, vi } from "vitest";

type RemotePattern = {
  protocol?: string;
  hostname?: string;
};

async function importNextConfig() {
  vi.resetModules();
  const loadedConfig = await import("../../../next.config");
  return loadedConfig.default;
}

function toPatterns(config: unknown): RemotePattern[] {
  if (!config || typeof config !== "object") {
    return [];
  }

  const images = (config as { images?: { remotePatterns?: unknown } }).images;
  if (!images || !Array.isArray(images.remotePatterns)) {
    return [];
  }

  return images.remotePatterns as RemotePattern[];
}

describe("next.config image remote patterns", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("includes OAuth avatar domains", async () => {
    vi.stubEnv("NEXT_PUBLIC_AVATAR_PUBLIC_URL", "");

    const config = await importNextConfig();
    const patterns = toPatterns(config);

    expect(patterns).toContainEqual({
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
    });
    expect(patterns).toContainEqual({
      protocol: "https",
      hostname: "lh3.googleusercontent.com",
    });
  });

  it("adds custom avatar public host from env", async () => {
    vi.stubEnv("NEXT_PUBLIC_AVATAR_PUBLIC_URL", "https://cdn.example.com/avatars");

    const config = await importNextConfig();
    const patterns = toPatterns(config);

    expect(patterns).toContainEqual({
      protocol: "https",
      hostname: "cdn.example.com",
    });
  });

  it("ignores invalid custom avatar public URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_AVATAR_PUBLIC_URL", "not-a-url");

    const config = await importNextConfig();
    const patterns = toPatterns(config);

    expect(patterns.some((pattern) => pattern.hostname === "not-a-url")).toBe(false);
  });
});
