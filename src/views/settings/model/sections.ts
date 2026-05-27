import { Gauge, Palette, ShieldCheck, SquareTerminal, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  SETTINGS_APPEARANCE_HREF,
  SETTINGS_EDITOR_HREF,
  SETTINGS_PERFORMANCE_HREF,
  SETTINGS_PROFILE_HREF,
  SETTINGS_SECURITY_HREF,
  type SettingsRoute,
  type SettingsSectionId,
} from "@/shared/config/routes";

export type SettingsSection = Readonly<{
  id: SettingsSectionId;
  href: SettingsRoute;
  label: string;
  meta: string;
  description: string;
  icon: LucideIcon;
}>;

const SETTINGS_SECTION_BY_ID = {
  profile: {
    id: "profile",
    href: SETTINGS_PROFILE_HREF,
    label: "Profile",
    meta: "Public",
    description:
      "Manage the public profile fields shown on your player page, including avatar, display name, location, and bio.",
    icon: UserRound,
  },
  security: {
    id: "security",
    href: SETTINGS_SECURITY_HREF,
    label: "Security",
    meta: "Auth",
    description:
      "Manage account access and start email-based password recovery when you need to rotate credentials.",
    icon: ShieldCheck,
  },
  appearance: {
    id: "appearance",
    href: SETTINGS_APPEARANCE_HREF,
    label: "Appearance",
    meta: "Theme",
    description: "Choose the shell palette with the best contrast for your environment.",
    icon: Palette,
  },
  editor: {
    id: "editor",
    href: SETTINGS_EDITOR_HREF,
    label: "Editor",
    meta: "Workspace",
    description:
      "Tune Monaco editor behavior, typography, cursor animation, padding, and layout for coding sessions.",
    icon: SquareTerminal,
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
  SETTINGS_SECTION_BY_ID.profile,
  SETTINGS_SECTION_BY_ID.security,
  SETTINGS_SECTION_BY_ID.appearance,
  SETTINGS_SECTION_BY_ID.editor,
  SETTINGS_SECTION_BY_ID.performance,
] as const;

export const DEFAULT_SETTINGS_SECTION = SETTINGS_SECTION_BY_ID.profile;

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return Object.hasOwn(SETTINGS_SECTION_BY_ID, value);
}

export function getSettingsSectionBySegment(segment: string | null | undefined) {
  return segment && isSettingsSectionId(segment)
    ? SETTINGS_SECTION_BY_ID[segment]
    : DEFAULT_SETTINGS_SECTION;
}
