import { describe, expect, it } from "vitest";

import * as FlagIcons from "country-flag-icons/react/3x2";

import { flagIcons } from "@/shared/lib/flags";

describe("flagIcons", () => {
  it("exposes country flag components by country code", () => {
    expect(flagIcons.DE).toBe(FlagIcons.DE);
    expect(flagIcons.UA).toBe(FlagIcons.UA);
    expect(flagIcons.US).toBe(FlagIcons.US);
  });

  it("contains known country codes", () => {
    expect("DE" in flagIcons).toBe(true);
    expect("UA" in flagIcons).toBe(true);
    expect("US" in flagIcons).toBe(true);
  });

  it("does not contain unknown country codes", () => {
    expect((flagIcons as Record<string, unknown>).UNKNOWN).toBeUndefined();
  });
});
