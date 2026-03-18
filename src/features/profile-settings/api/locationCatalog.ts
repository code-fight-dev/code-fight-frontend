type LocationCatalogResponse = {
  items?: unknown;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

async function fetchLocationOptions(url: string) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to load location data");
  }

  const body = (await response
    .json()
    .catch(() => null)) as LocationCatalogResponse | null;
  if (!body || !isStringArray(body.items)) {
    throw new Error("Invalid location response");
  }

  return body.items;
}

export function getLocationCountryOptions() {
  return fetchLocationOptions("/api/locations?scope=countries");
}

export function getLocationStateOptions(country: string) {
  return fetchLocationOptions(
    `/api/locations?scope=states&country=${encodeURIComponent(country)}`,
  );
}

export function getLocationCityOptions(country: string, stateProvince: string) {
  return fetchLocationOptions(
    `/api/locations?scope=cities&country=${encodeURIComponent(country)}&stateProvince=${encodeURIComponent(stateProvince)}`,
  );
}
