import { describe, expect, it } from "vitest";

import {
  getCountryCodeByName,
  normalizeCountryCode,
  resolveCountryCode,
} from "@/shared/lib/country";

describe("normalizeCountryCode", () => {
  it("trims country code and converts it to uppercase", () => {
    expect(normalizeCountryCode(" de ")).toBe("DE");
    expect(normalizeCountryCode("ua")).toBe("UA");
    expect(normalizeCountryCode(" Us ")).toBe("US");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(normalizeCountryCode("   ")).toBe("");
  });
});

describe("getCountryCodeByName", () => {
  it("returns country code by country name", () => {
    expect(getCountryCodeByName("Germany")).toBe("DE");
    expect(getCountryCodeByName("Ukraine")).toBe("UA");
    expect(getCountryCodeByName("United States")).toBe("US");
  });

  it("normalizes country name before lookup", () => {
    expect(getCountryCodeByName(" germany ")).toBe("DE");
    expect(getCountryCodeByName("UKRAINE")).toBe("UA");
    expect(getCountryCodeByName(" united states ")).toBe("US");
  });

  it("returns an empty string for empty or unknown country name", () => {
    expect(getCountryCodeByName("")).toBe("");
    expect(getCountryCodeByName("   ")).toBe("");
    expect(getCountryCodeByName("Unknown Country")).toBe("");
  });
});

describe("resolveCountryCode", () => {
  it("returns normalized country code when it is valid", () => {
    expect(resolveCountryCode("de")).toBe("DE");
    expect(resolveCountryCode(" ua ")).toBe("UA");
    expect(resolveCountryCode("us")).toBe("US");
  });

  it("prefers valid country code over country name", () => {
    expect(resolveCountryCode("de", "Ukraine")).toBe("DE");
  });

  it("falls back to country name when country code is invalid", () => {
    expect(resolveCountryCode("invalid", "Germany")).toBe("DE");
    expect(resolveCountryCode("", "Ukraine")).toBe("UA");
  });

  it("returns an empty string when both country code and country name are invalid", () => {
    expect(resolveCountryCode("invalid", "Unknown Country")).toBe("");
    expect(resolveCountryCode("", "")).toBe("");
    expect(resolveCountryCode("   ", "   ")).toBe("");
  });
});
