import { MoonStar, SunMedium, Zap, ZapOff } from "lucide-react";
import type {
  PreferenceOption,
  PreferenceSectionDefinition,
} from "@/features/preferences/model/definitions";
import type {
  MotionPreference,
  ThemePreference,
} from "@/features/preferences/model/types";

export const THEME_OPTIONS = [
  {
    value: "default",
    label: "Dark",
    eyebrow: "Low-light",
    description: "Deeper contrast for focus-heavy sessions.",
    details: ["Higher contrast", "Blue accents"],
    previewVariant: "dark-theme",
    icon: MoonStar,
  },
  {
    value: "light",
    label: "Light",
    eyebrow: "Daylight",
    description: "Brighter canvas with softer contrast edges.",
    details: ["Airier surface", "Sharper text"],
    previewVariant: "light-theme",
    icon: SunMedium,
  },
] as const satisfies readonly PreferenceOption<ThemePreference>[];

export const MOTION_OPTIONS = [
  {
    value: "enabled",
    label: "Standard",
    eyebrow: "Animated",
    description: "Keeps transitions and visual polish fully enabled.",
    details: ["Reveal effects", "Glass blur"],
    previewVariant: "standard-motion",
    icon: Zap,
  },
  {
    value: "disabled",
    label: "Reduced",
    eyebrow: "Lighter",
    description: "Cuts motion and expensive visual effects for steadier rendering.",
    details: ["Animations off", "Blur off"],
    previewVariant: "reduced-motion",
    icon: ZapOff,
  },
] as const satisfies readonly PreferenceOption<MotionPreference>[];

export const APPEARANCE_PREFERENCE_SECTION = {
  name: "theme-preference",
  eyebrow: "Appearance",
  title: "Theme",
  description:
    "Pick the palette that feels most comfortable for your current environment.",
  options: THEME_OPTIONS,
} as const satisfies PreferenceSectionDefinition<ThemePreference>;

export const PERFORMANCE_PREFERENCE_SECTION = {
  name: "motion-preference",
  eyebrow: "Performance",
  title: "Motion",
  description:
    "Choose between the full visual treatment and a lighter interface profile.",
  options: MOTION_OPTIONS,
} as const satisfies PreferenceSectionDefinition<MotionPreference>;

export function getThemePreferenceLabel(theme: ThemePreference) {
  return theme === "light" ? "Light" : "Dark";
}

export function getMotionPreferenceLabel(motion: MotionPreference) {
  return motion === "disabled" ? "Reduced" : "Standard";
}
