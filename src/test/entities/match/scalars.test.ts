import { describe, expect, it } from "vitest";

import {
  isRecord,
  readOptionalBoolean,
  readOptionalNumber,
  readOptionalString,
  readRequiredNumber,
  readString,
} from "@/entities/match/testing";

describe("isRecord", () => {
  it("returns true for non-null objects", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ id: "1" })).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isRecord([])).toBe(false);
  });

  it("returns false for null and primitive values", () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord("value")).toBe(false);
    expect(isRecord(123)).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});

describe("readString", () => {
  it("returns string value when value is a string", () => {
    expect(readString("hello")).toBe("hello");
    expect(readString("")).toBe("");
  });

  it("returns default empty fallback for non-string values", () => {
    expect(readString(null)).toBe("");
    expect(readString(undefined)).toBe("");
    expect(readString(123)).toBe("");
    expect(readString(true)).toBe("");
  });

  it("returns custom fallback for non-string values", () => {
    expect(readString(null, "fallback")).toBe("fallback");
    expect(readString(123, "fallback")).toBe("fallback");
  });
});

describe("readOptionalString", () => {
  it("returns string value when value is a string", () => {
    expect(readOptionalString("hello")).toBe("hello");
    expect(readOptionalString("")).toBe("");
  });

  it("returns undefined for non-string values", () => {
    expect(readOptionalString(null)).toBeUndefined();
    expect(readOptionalString(undefined)).toBeUndefined();
    expect(readOptionalString(123)).toBeUndefined();
    expect(readOptionalString(false)).toBeUndefined();
  });
});

describe("readOptionalNumber", () => {
  it("returns finite number values", () => {
    expect(readOptionalNumber(0)).toBe(0);
    expect(readOptionalNumber(42)).toBe(42);
    expect(readOptionalNumber(-5)).toBe(-5);
    expect(readOptionalNumber(3.14)).toBe(3.14);
  });

  it("parses finite numeric strings", () => {
    expect(readOptionalNumber("0")).toBe(0);
    expect(readOptionalNumber("42")).toBe(42);
    expect(readOptionalNumber(" 42 ")).toBe(42);
    expect(readOptionalNumber("-5")).toBe(-5);
    expect(readOptionalNumber("3.14")).toBe(3.14);
  });

  it("returns undefined for empty, invalid, infinite or missing values", () => {
    expect(readOptionalNumber("")).toBeUndefined();
    expect(readOptionalNumber("   ")).toBeUndefined();
    expect(readOptionalNumber("abc")).toBeUndefined();
    expect(readOptionalNumber(Number.NaN)).toBeUndefined();
    expect(readOptionalNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(readOptionalNumber(Number.NEGATIVE_INFINITY)).toBeUndefined();
    expect(readOptionalNumber(null)).toBeUndefined();
    expect(readOptionalNumber(undefined)).toBeUndefined();
    expect(readOptionalNumber(true)).toBeUndefined();
  });
});

describe("readRequiredNumber", () => {
  it("returns finite number values", () => {
    expect(readRequiredNumber(0)).toBe(0);
    expect(readRequiredNumber(42)).toBe(42);
    expect(readRequiredNumber(-5)).toBe(-5);
    expect(readRequiredNumber(3.14)).toBe(3.14);
  });

  it("parses finite numeric strings", () => {
    expect(readRequiredNumber("0")).toBe(0);
    expect(readRequiredNumber("42")).toBe(42);
    expect(readRequiredNumber(" 42 ")).toBe(42);
    expect(readRequiredNumber("-5")).toBe(-5);
    expect(readRequiredNumber("3.14")).toBe(3.14);
  });

  it("returns null for empty, invalid, infinite or missing values", () => {
    expect(readRequiredNumber("")).toBeNull();
    expect(readRequiredNumber("   ")).toBeNull();
    expect(readRequiredNumber("abc")).toBeNull();
    expect(readRequiredNumber(Number.NaN)).toBeNull();
    expect(readRequiredNumber(Number.POSITIVE_INFINITY)).toBeNull();
    expect(readRequiredNumber(Number.NEGATIVE_INFINITY)).toBeNull();
    expect(readRequiredNumber(null)).toBeNull();
    expect(readRequiredNumber(undefined)).toBeNull();
    expect(readRequiredNumber(false)).toBeNull();
  });
});

describe("readOptionalBoolean", () => {
  it("returns undefined for nullish values", () => {
    expect(readOptionalBoolean(undefined)).toBeUndefined();
    expect(readOptionalBoolean(null)).toBeUndefined();
  });

  it("returns boolean values as is", () => {
    expect(readOptionalBoolean(true)).toBe(true);
    expect(readOptionalBoolean(false)).toBe(false);
  });

  it("parses boolean strings", () => {
    expect(readOptionalBoolean("true")).toBe(true);
    expect(readOptionalBoolean("false")).toBe(false);
    expect(readOptionalBoolean(" TRUE ")).toBe(true);
    expect(readOptionalBoolean(" FALSE ")).toBe(false);
  });

  it("returns undefined for empty strings", () => {
    expect(readOptionalBoolean("")).toBeUndefined();
    expect(readOptionalBoolean("   ")).toBeUndefined();
  });

  it("returns null for invalid non-empty strings and non-boolean primitives", () => {
    expect(readOptionalBoolean("yes")).toBeNull();
    expect(readOptionalBoolean("no")).toBeNull();
    expect(readOptionalBoolean("1")).toBeNull();
    expect(readOptionalBoolean(1)).toBeNull();
    expect(readOptionalBoolean(0)).toBeNull();
    expect(readOptionalBoolean({})).toBeNull();
    expect(readOptionalBoolean([])).toBeNull();
  });
});
