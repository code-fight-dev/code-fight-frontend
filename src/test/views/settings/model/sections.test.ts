import { describe, expect, it } from "vitest";

import {
  DEFAULT_SETTINGS_SECTION,
  getSettingsSectionBySegment,
  isSettingsSectionId,
  SETTINGS_SECTIONS,
} from "@/views/settings/model/sections";

describe("settings sections model", () => {
  it("exposes settings sections in the expected order", () => {
    expect(SETTINGS_SECTIONS.map((section) => section.id)).toEqual([
      "profile",
      "appearance",
      "editor",
      "performance",
    ]);
  });

  it("uses profile as default settings section", () => {
    expect(DEFAULT_SETTINGS_SECTION.id).toBe("profile");
    expect(DEFAULT_SETTINGS_SECTION).toBe(SETTINGS_SECTIONS[0]);
  });

  it("detects valid settings section ids", () => {
    expect(isSettingsSectionId("profile")).toBe(true);
    expect(isSettingsSectionId("appearance")).toBe(true);
    expect(isSettingsSectionId("editor")).toBe(true);
    expect(isSettingsSectionId("performance")).toBe(true);
  });

  it("rejects unknown settings section ids", () => {
    expect(isSettingsSectionId("billing")).toBe(false);
    expect(isSettingsSectionId("")).toBe(false);
    expect(isSettingsSectionId("__proto__")).toBe(false);
  });

  it("returns section by valid route segment", () => {
    expect(getSettingsSectionBySegment("profile").id).toBe("profile");
    expect(getSettingsSectionBySegment("appearance").id).toBe("appearance");
    expect(getSettingsSectionBySegment("editor").id).toBe("editor");
    expect(getSettingsSectionBySegment("performance").id).toBe("performance");
  });

  it("returns default section for missing or unknown route segment", () => {
    expect(getSettingsSectionBySegment(null)).toBe(DEFAULT_SETTINGS_SECTION);
    expect(getSettingsSectionBySegment(undefined)).toBe(DEFAULT_SETTINGS_SECTION);
    expect(getSettingsSectionBySegment("billing")).toBe(DEFAULT_SETTINGS_SECTION);
    expect(getSettingsSectionBySegment("")).toBe(DEFAULT_SETTINGS_SECTION);
  });
});
