import { beforeEach, describe, expect, it, vi } from "vitest";

const LOCATION_CATALOG_MODULE = "@/features/profile-settings/model/locationCatalog";

function createRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as unknown;
}

describe("app/api/health/route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns frontend health status", async () => {
    const { GET } = await import("@/app/api/health/route");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "ok",
      service: "frontend",
    });
  });
});

describe("app/api/locations/route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns countries and cache headers for countries scope", async () => {
    vi.doMock(LOCATION_CATALOG_MODULE, () => ({
      getCountryOptions: vi.fn(() => ["United States", "Canada"]),
      getStateProvinceOptions: vi.fn(),
      getCityOptions: vi.fn(),
    }));

    const { GET } = await import("@/app/api/locations/route");
    const catalog = await import(LOCATION_CATALOG_MODULE);

    const response = await GET(
      createRequest("https://example.test/api/locations?scope=countries") as never,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=86400, s-maxage=86400",
    );
    await expect(response.json()).resolves.toEqual({
      items: ["United States", "Canada"],
    });
    expect(vi.mocked(catalog.getCountryOptions)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(catalog.getStateProvinceOptions)).not.toHaveBeenCalled();
    expect(vi.mocked(catalog.getCityOptions)).not.toHaveBeenCalled();
  });

  it("trims country before resolving states", async () => {
    vi.doMock(LOCATION_CATALOG_MODULE, () => ({
      getCountryOptions: vi.fn(),
      getStateProvinceOptions: vi.fn(() => ["California", "New York"]),
      getCityOptions: vi.fn(),
    }));

    const { GET } = await import("@/app/api/locations/route");
    const catalog = await import(LOCATION_CATALOG_MODULE);

    const response = await GET(
      createRequest(
        "https://example.test/api/locations?scope=states&country=%20US%20",
      ) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: ["California", "New York"],
    });
    expect(vi.mocked(catalog.getStateProvinceOptions)).toHaveBeenCalledWith("US");
    expect(vi.mocked(catalog.getCityOptions)).not.toHaveBeenCalled();
  });

  it("trims country and stateProvince before resolving cities", async () => {
    vi.doMock(LOCATION_CATALOG_MODULE, () => ({
      getCountryOptions: vi.fn(),
      getStateProvinceOptions: vi.fn(),
      getCityOptions: vi.fn(() => ["San Francisco"]),
    }));

    const { GET } = await import("@/app/api/locations/route");
    const catalog = await import(LOCATION_CATALOG_MODULE);

    const response = await GET(
      createRequest(
        "https://example.test/api/locations?scope=cities&country=%20US%20&stateProvince=%20CA%20",
      ) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: ["San Francisco"],
    });
    expect(vi.mocked(catalog.getCityOptions)).toHaveBeenCalledWith("US", "CA");
    expect(vi.mocked(catalog.getCountryOptions)).not.toHaveBeenCalled();
  });

  it("returns 400 for unsupported scope", async () => {
    vi.doMock(LOCATION_CATALOG_MODULE, () => ({
      getCountryOptions: vi.fn(),
      getStateProvinceOptions: vi.fn(),
      getCityOptions: vi.fn(),
    }));

    const { GET } = await import("@/app/api/locations/route");
    const catalog = await import(LOCATION_CATALOG_MODULE);

    const response = await GET(
      createRequest("https://example.test/api/locations?scope=unknown") as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        message: "Invalid location scope",
      },
    });
    expect(vi.mocked(catalog.getCountryOptions)).not.toHaveBeenCalled();
    expect(vi.mocked(catalog.getStateProvinceOptions)).not.toHaveBeenCalled();
    expect(vi.mocked(catalog.getCityOptions)).not.toHaveBeenCalled();
  });
});
