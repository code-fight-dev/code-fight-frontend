import { City, Country, State } from "country-state-city";

const countryOptionsCache = Country.getAllCountries()
  .map((country) => country.name)
  .sort((left, right) => left.localeCompare(right));

const countryByNameCache = new Map(
  Country.getAllCountries().map((country) => [country.name, country]),
);

const stateOptionsCache = new Map<string, string[]>();
const cityOptionsCache = new Map<string, string[]>();

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function getCountryByName(countryName: string) {
  return countryByNameCache.get(countryName) ?? null;
}

function getStateByName(countryName: string, stateProvinceName: string) {
  const country = getCountryByName(countryName);

  if (!country) {
    return null;
  }

  return (
    State.getStatesOfCountry(country.isoCode).find(
      (state) => state.name === stateProvinceName,
    ) ?? null
  );
}

export function getCountryOptions() {
  return countryOptionsCache;
}

export function getStateProvinceOptions(countryName: string) {
  if (!countryName) {
    return [];
  }

  const cachedOptions = stateOptionsCache.get(countryName);
  if (cachedOptions) {
    return cachedOptions;
  }

  const country = getCountryByName(countryName);
  if (!country) {
    return [];
  }

  const options = uniqueSorted(
    State.getStatesOfCountry(country.isoCode).map((state) => state.name),
  );

  stateOptionsCache.set(countryName, options);

  return options;
}

export function getCityOptions(countryName: string, stateProvinceName: string) {
  if (!countryName) {
    return [];
  }

  const cacheKey = `${countryName}::${stateProvinceName}`;
  const cachedOptions = cityOptionsCache.get(cacheKey);
  if (cachedOptions) {
    return cachedOptions;
  }

  const country = getCountryByName(countryName);
  if (!country) {
    return [];
  }

  const cities = stateProvinceName
    ? (City.getCitiesOfState(
        country.isoCode,
        getStateByName(countryName, stateProvinceName)?.isoCode ?? "",
      ) ?? [])
    : (City.getCitiesOfCountry(country.isoCode) ?? []);

  const options = uniqueSorted(cities.map((city) => city.name));
  cityOptionsCache.set(cacheKey, options);

  return options;
}
