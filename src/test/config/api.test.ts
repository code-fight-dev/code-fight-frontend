import { afterEach, describe, expect, it, vi } from "vitest";

async function importApiConfig() {
  vi.resetModules();

  return import("@/shared/config/api");
}

function mockClientEnvironment() {
  // Note: jsdom already provides window, so this function is mainly for readability.
}

function mockServerEnvironment() {
  vi.stubGlobal("window", undefined);
}

describe("API_BASE_URL in client environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("uses default API base URL when public env is missing", async () => {
    mockClientEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.stubEnv("INTERNAL_API_BASE_URL", "");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("http://localhost:8080");
  });

  it("uses public API base URL in browser environment", async () => {
    mockClientEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.codefight.dev");
    vi.stubEnv("INTERNAL_API_BASE_URL", "https://internal.codefight.dev");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("https://api.codefight.dev");
  });

  it("normalizes public API base URL", async () => {
    mockClientEnvironment();

    vi.stubEnv(
      "NEXT_PUBLIC_API_BASE_URL",
      " https://api.codefight.dev/v1/?token=secret#section ",
    );

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("https://api.codefight.dev/v1");
  });

  it("falls back to default API base URL when public URL is invalid", async () => {
    mockClientEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "not-a-url");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("http://localhost:8080");
  });

  it("rejects non-http public URLs", async () => {
    mockClientEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "ftp://api.codefight.dev");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("http://localhost:8080");
  });
});

describe("API_BASE_URL in server environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("prefers internal API base URL on the server", async () => {
    mockServerEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://public.codefight.dev");
    vi.stubEnv("INTERNAL_API_BASE_URL", "http://backend:8080");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("http://backend:8080");
  });

  it("falls back to public API base URL on the server when internal URL is missing", async () => {
    mockServerEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://public.codefight.dev");
    vi.stubEnv("INTERNAL_API_BASE_URL", "");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("https://public.codefight.dev");
  });

  it("falls back to default API base URL on the server when both env values are invalid", async () => {
    mockServerEnvironment();

    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "invalid-public-url");
    vi.stubEnv("INTERNAL_API_BASE_URL", "ftp://internal.codefight.dev");

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("http://localhost:8080");
  });

  it("normalizes internal API base URL on the server", async () => {
    mockServerEnvironment();

    vi.stubEnv(
      "INTERNAL_API_BASE_URL",
      " http://backend:8080/internal/?debug=true#hash ",
    );

    const { API_BASE_URL } = await importApiConfig();

    expect(API_BASE_URL).toBe("http://backend:8080/internal");
  });
});
