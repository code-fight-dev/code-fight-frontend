import { Country } from "country-state-city";

function normalizeCountryName(countryName: string) {
  return countryName.trim().toLowerCase();
}

export function normalizeCountryCode(countryCode: string) {
  return countryCode.trim().toUpperCase();
}

const countryCodes = new Set(
  Country.getAllCountries().map((country) => normalizeCountryCode(country.isoCode)),
);
const countryCodeByName = new Map(
  Country.getAllCountries().map((country) => [
    normalizeCountryName(country.name),
    normalizeCountryCode(country.isoCode),
  ]),
);

export function getCountryCodeByName(countryName: string): string {
  const normalizedCountryName = normalizeCountryName(countryName);

  if (!normalizedCountryName) {
    return "";
  }

  return countryCodeByName.get(normalizedCountryName) ?? "";
}

export function resolveCountryCode(countryCode: string, countryName = ""): string {
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  if (normalizedCountryCode && countryCodes.has(normalizedCountryCode)) {
    return normalizedCountryCode;
  }

  return getCountryCodeByName(countryName);
}
