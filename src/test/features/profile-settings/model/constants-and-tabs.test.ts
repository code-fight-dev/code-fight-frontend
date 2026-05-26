import { describe, expect, it } from "vitest";

import {
  PROFILE_BIO_LIMIT,
  PROFILE_DISPLAY_NAME_LIMIT,
  PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS,
  PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS,
  PROFILE_SETTINGS_TOAST_DURATION_MS,
} from "@/features/profile-settings/model/constants";
import { PROFILE_SETTINGS_TAB_IDS } from "@/features/profile-settings/model/tabs";

describe("features/profile-settings/model constants and tabs", () => {
  it("exposes valid profile settings limits and timing invariants", () => {
    expect(PROFILE_DISPLAY_NAME_LIMIT).toBeGreaterThan(0);
    expect(PROFILE_BIO_LIMIT).toBeGreaterThan(0);
    expect(PROFILE_BIO_LIMIT).toBeGreaterThanOrEqual(PROFILE_DISPLAY_NAME_LIMIT);

    expect(PROFILE_SETTINGS_TOAST_DURATION_MS).toBeGreaterThan(0);
    expect(PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS).toBeGreaterThanOrEqual(0);
    expect(PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS).toBeGreaterThan(0);
    expect(PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS).toBeGreaterThan(
      PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS,
    );

    expect(Number.isInteger(PROFILE_DISPLAY_NAME_LIMIT)).toBe(true);
    expect(Number.isInteger(PROFILE_BIO_LIMIT)).toBe(true);
    expect(Number.isInteger(PROFILE_SETTINGS_TOAST_DURATION_MS)).toBe(true);
    expect(Number.isInteger(PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS)).toBe(true);
    expect(Number.isInteger(PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS)).toBe(true);
  });

  it("exposes stable tab ids", () => {
    expect(PROFILE_SETTINGS_TAB_IDS).toEqual([
      "photo",
      "display-name",
      "location",
      "bio",
    ]);
  });
});
