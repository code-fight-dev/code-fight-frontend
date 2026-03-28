"use client";

import {
  APPEARANCE_PREFERENCE_SECTION,
  getMotionPreferenceLabel,
  getThemePreferenceLabel,
  PERFORMANCE_PREFERENCE_SECTION,
} from "@/features/preferences/model/settingsSections";
import { usePreferences } from "@/features/preferences/ui/PreferencesProvider";
import { PreferenceSection } from "@/features/preferences/ui/PreferenceSection";

export function AppearanceSettingsPanel() {
  const { preferences, setTheme } = usePreferences();

  return (
    <PreferenceSection
      {...APPEARANCE_PREFERENCE_SECTION}
      currentValue={preferences.theme}
      currentLabel={getThemePreferenceLabel(preferences.theme)}
      onSelect={setTheme}
    />
  );
}

export function PerformanceSettingsPanel() {
  const { preferences, setMotion } = usePreferences();

  return (
    <PreferenceSection
      {...PERFORMANCE_PREFERENCE_SECTION}
      currentValue={preferences.motion}
      currentLabel={getMotionPreferenceLabel(preferences.motion)}
      onSelect={setMotion}
    />
  );
}

export function PreferencesSettingsPanel() {
  return (
    <div className="space-y-10 lg:space-y-12">
      <AppearanceSettingsPanel />
      <PerformanceSettingsPanel />
    </div>
  );
}
