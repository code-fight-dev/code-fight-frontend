import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getLocationCityOptions,
  getLocationCountryOptions,
  getLocationStateOptions,
} from "@/features/profile-settings/api/locationCatalog";

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("features/profile-settings/api/locationCatalog", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads country options with expected request options", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createJsonResponse({ items: ["Canada", "United States"] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationCountryOptions()).resolves.toEqual([
      "Canada",
      "United States",
    ]);

    expect(fetchMock).toHaveBeenCalledWith("/api/locations?scope=countries", {
      method: "GET",
      credentials: "same-origin",
      cache: "force-cache",
    });
  });

  it("encodes query params for states and cities endpoints", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(createJsonResponse({ items: ["ok"] })));
    vi.stubGlobal("fetch", fetchMock);

    await getLocationStateOptions("United States/CA");
    await getLocationCityOptions("United States", "New York & Queens");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/locations?scope=states&country=United%20States%2FCA",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/locations?scope=cities&country=United%20States&stateProvince=New%20York%20%26%20Queens",
      expect.any(Object),
    );
  });

  it("throws location data error for non-ok response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationCountryOptions()).rejects.toThrow(
      "Failed to load location data",
    );
  });

  it("throws invalid response error when JSON parsing fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("invalid-json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationCountryOptions()).rejects.toThrow(
      "Invalid location response",
    );
  });

  it("throws invalid response error when items are missing or malformed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createJsonResponse({}))
      .mockResolvedValueOnce(createJsonResponse({ items: [1, "valid"] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLocationCountryOptions()).rejects.toThrow(
      "Invalid location response",
    );
    await expect(getLocationCountryOptions()).rejects.toThrow(
      "Invalid location response",
    );
  });
});
