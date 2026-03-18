export const PROFILE_SETTINGS_TAB_IDS = [
  "photo",
  "display-name",
  "location",
  "bio",
] as const;

export type ProfileSettingsTabId = (typeof PROFILE_SETTINGS_TAB_IDS)[number];
