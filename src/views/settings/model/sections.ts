import { Gauge, Palette } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  SETTINGS_APPEARANCE_HREF,
  SETTINGS_PERFORMANCE_HREF,
  type SettingsRoute,
  type SettingsSectionId,
} from "@/shared/config/routes";

type SettingsSection = Readonly<{
  id: SettingsSectionId;
  href: SettingsRoute;
  label: string;
  meta: string;
  description: string;
  icon: LucideIcon;
}>;

const SETTINGS_SECTION_BY_ID = {
  appearance: {
    id: "appearance",
    href: SETTINGS_APPEARANCE_HREF,
    label: "Appearance",
    meta: "Theme",
    description: "Choose the shell palette with the best contrast for your environment.",
    icon: Palette,
  },
  performance: {
    id: "performance",
    href: SETTINGS_PERFORMANCE_HREF,
    label: "Performance",
    meta: "Motion",
    description: "Switch between richer motion and a lighter rendering profile.",
    icon: Gauge,
  },
} as const satisfies Record<SettingsSectionId, SettingsSection>;

export const SETTINGS_SECTIONS = [
  SETTINGS_SECTION_BY_ID.appearance,
  SETTINGS_SECTION_BY_ID.performance,
] as const;

export const DEFAULT_SETTINGS_SECTION = SETTINGS_SECTION_BY_ID.appearance;

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return Object.hasOwn(SETTINGS_SECTION_BY_ID, value);
}

export function getSettingsSectionBySegment(segment: string | null | undefined) {
  return segment && isSettingsSectionId(segment)
    ? SETTINGS_SECTION_BY_ID[segment]
    : DEFAULT_SETTINGS_SECTION;
}
