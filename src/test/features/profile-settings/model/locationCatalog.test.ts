import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const LOCATION_CATALOG_MODULE = "@/features/profile-settings/model/locationCatalog";

type CountryItem = { name: string; isoCode: string };
type StateItem = { name: string; isoCode: string };
type CityItem = { name: string };

function createCatalogDataset() {
  const countries: CountryItem[] = [
    { name: "Canada", isoCode: "CA" },
    { name: "United States", isoCode: "US" },
  ];
  const statesByCountry: Record<string, StateItem[]> = {
    US: [
      { name: "California", isoCode: "CA" },
      { name: "California", isoCode: "CA" },
      { name: "New York", isoCode: "NY" },
    ],
    CA: [{ name: "Ontario", isoCode: "ON" }],
  };
  const citiesByCountry: Record<string, CityItem[]> = {
    US: [{ name: "Austin" }, { name: "Austin" }, { name: "Seattle" }],
    CA: [{ name: "Toronto" }],
  };
  const citiesByState: Record<string, CityItem[]> = {
    "US::CA": [{ name: "San Francisco" }, { name: "San Francisco" }, { name: "Fresno" }],
    "US::NY": [{ name: "New York City" }],
    "CA::ON": [{ name: "Toronto" }],
  };

  return {
    countries,
    statesByCountry,
    citiesByCountry,
    citiesByState,
  };
}

async function loadLocationCatalogWithMocks(dataset = createCatalogDataset()) {
  vi.resetModules();

  const getAllCountries = vi.fn(() => dataset.countries);
  const getStatesOfCountry = vi.fn((countryIsoCode: string) => {
    return dataset.statesByCountry[countryIsoCode] ?? [];
  });
  const getCitiesOfCountry = vi.fn((countryIsoCode: string) => {
    return dataset.citiesByCountry[countryIsoCode] ?? [];
  });
  const getCitiesOfState = vi.fn((countryIsoCode: string, stateIsoCode: string) => {
    return dataset.citiesByState[`${countryIsoCode}::${stateIsoCode}`] ?? [];
  });

  vi.doMock("country-state-city", () => ({
    Country: {
      getAllCountries,
    },
    State: {
      getStatesOfCountry,
    },
    City: {
      getCitiesOfCountry,
      getCitiesOfState,
    },
  }));

  const locationCatalog = await import(LOCATION_CATALOG_MODULE);

  return {
    locationCatalog,
    getAllCountries,
    getStatesOfCountry,
    getCitiesOfCountry,
    getCitiesOfState,
  };
}

describe("features/profile-settings/model/locationCatalog", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns sorted country options from module cache without reloading countries", async () => {
    const { locationCatalog, getAllCountries } = await loadLocationCatalogWithMocks();
    const callsAfterImport = getAllCountries.mock.calls.length;

    const first = locationCatalog.getCountryOptions();
    const second = locationCatalog.getCountryOptions();

    expect(first).toEqual(["Canada", "United States"]);
    expect(second).toBe(first);
    expect(callsAfterImport).toBe(1);
    expect(getAllCountries).toHaveBeenCalledTimes(1);
  });

  it("returns empty state options for empty or unknown country", async () => {
    const { locationCatalog, getStatesOfCountry } = await loadLocationCatalogWithMocks();

    expect(locationCatalog.getStateProvinceOptions("")).toEqual([]);
    expect(locationCatalog.getStateProvinceOptions("Unknownland")).toEqual([]);
    expect(getStatesOfCountry).not.toHaveBeenCalled();
  });

  it("resolves state options, removes duplicates, sorts, and caches results", async () => {
    const { locationCatalog, getStatesOfCountry } = await loadLocationCatalogWithMocks();

    const first = locationCatalog.getStateProvinceOptions("United States");
    const second = locationCatalog.getStateProvinceOptions("United States");

    expect(first).toEqual(["California", "New York"]);
    expect(second).toBe(first);
    expect(getStatesOfCountry).toHaveBeenCalledTimes(1);
    expect(getStatesOfCountry).toHaveBeenCalledWith("US");
  });

  it("returns empty city options for empty or unknown country", async () => {
    const { locationCatalog, getCitiesOfCountry, getCitiesOfState } =
      await loadLocationCatalogWithMocks();

    expect(locationCatalog.getCityOptions("", "")).toEqual([]);
    expect(locationCatalog.getCityOptions("Unknownland", "")).toEqual([]);
    expect(getCitiesOfCountry).not.toHaveBeenCalled();
    expect(getCitiesOfState).not.toHaveBeenCalled();
  });

  it("resolves city options by country when state is empty and caches response", async () => {
    const { locationCatalog, getCitiesOfCountry, getCitiesOfState } =
      await loadLocationCatalogWithMocks();

    const first = locationCatalog.getCityOptions("United States", "");
    const second = locationCatalog.getCityOptions("United States", "");

    expect(first).toEqual(["Austin", "Seattle"]);
    expect(second).toBe(first);
    expect(getCitiesOfCountry).toHaveBeenCalledTimes(1);
    expect(getCitiesOfCountry).toHaveBeenCalledWith("US");
    expect(getCitiesOfState).not.toHaveBeenCalled();
  });

  it("resolves city options by state and falls back to empty state code when state is missing", async () => {
    const { locationCatalog, getCitiesOfState } = await loadLocationCatalogWithMocks();

    expect(locationCatalog.getCityOptions("United States", "California")).toEqual([
      "Fresno",
      "San Francisco",
    ]);
    expect(getCitiesOfState).toHaveBeenCalledWith("US", "CA");

    expect(locationCatalog.getCityOptions("United States", "Missing State")).toEqual([]);
    expect(getCitiesOfState).toHaveBeenCalledWith("US", "");
  });
});
