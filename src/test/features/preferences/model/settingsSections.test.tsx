import { MoonStar, SunMedium, Zap, ZapOff } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  APPEARANCE_PREFERENCE_SECTION,
  getMotionPreferenceLabel,
  getThemePreferenceLabel,
  MOTION_OPTIONS,
  PERFORMANCE_PREFERENCE_SECTION,
  THEME_OPTIONS,
} from "@/features/preferences/model/settingsSections";

describe("features/preferences/model/settingsSections", () => {
  it("exposes stable theme options and section contract", () => {
    expect(THEME_OPTIONS).toHaveLength(2);
    expect(THEME_OPTIONS[0]).toEqual(
      expect.objectContaining({
        value: "default",
        label: "Dark",
        previewVariant: "dark-theme",
      }),
    );
    expect(THEME_OPTIONS[1]).toEqual(
      expect.objectContaining({
        value: "light",
        label: "Light",
        previewVariant: "light-theme",
      }),
    );
    expect(THEME_OPTIONS[0].icon).toBe(MoonStar);
    expect(THEME_OPTIONS[1].icon).toBe(SunMedium);

    expect(APPEARANCE_PREFERENCE_SECTION).toEqual(
      expect.objectContaining({
        name: "theme-preference",
        eyebrow: "Appearance",
        title: "Theme",
        options: THEME_OPTIONS,
      }),
    );
  });

  it("exposes stable motion options and section contract", () => {
    expect(MOTION_OPTIONS).toHaveLength(2);
    expect(MOTION_OPTIONS[0]).toEqual(
      expect.objectContaining({
        value: "enabled",
        label: "Standard",
        previewVariant: "standard-motion",
      }),
    );
    expect(MOTION_OPTIONS[1]).toEqual(
      expect.objectContaining({
        value: "disabled",
        label: "Reduced",
        previewVariant: "reduced-motion",
      }),
    );
    expect(MOTION_OPTIONS[0].icon).toBe(Zap);
    expect(MOTION_OPTIONS[1].icon).toBe(ZapOff);

    expect(PERFORMANCE_PREFERENCE_SECTION).toEqual(
      expect.objectContaining({
        name: "motion-preference",
        eyebrow: "Performance",
        title: "Motion",
        options: MOTION_OPTIONS,
      }),
    );
  });

  it("resolves human-readable preference labels", () => {
    expect(getThemePreferenceLabel("default")).toBe("Dark");
    expect(getThemePreferenceLabel("light")).toBe("Light");

    expect(getMotionPreferenceLabel("enabled")).toBe("Standard");
    expect(getMotionPreferenceLabel("disabled")).toBe("Reduced");
  });
});
