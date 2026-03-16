import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MoonStar, SunMedium, Zap, ZapOff } from "lucide-react";
import type { MotionPreference, ThemePreference } from "./types";

export type PreferenceOption<T extends string> = Readonly<{
  value: T;
  label: string;
  eyebrow: string;
  description: string;
  details: readonly string[];
  preview: ReactNode;
  icon: LucideIcon;
}>;

export type PreferenceSectionDefinition<T extends string> = Readonly<{
  name: `${string}-preference`;
  eyebrow: string;
  title: string;
  description: string;
  options: readonly PreferenceOption<T>[];
}>;

function DarkThemePreview() {
  return (
    <div className="app-settings-preview-shell border-white/10 bg-[#091120] text-white">
      <div className="border-b border-white/8 px-2.5 py-2">
        <div className="h-1.5 w-10 rounded-full bg-blue-400/75" />
      </div>
      <div className="space-y-2 px-2.5 py-2.5">
        <div className="h-2 rounded-full bg-white/18" />
        <div className="h-2 w-4/5 rounded-full bg-white/10" />
        <div className="flex gap-1.5">
          <span className="h-4 flex-1 rounded-md bg-blue-400/22" />
          <span className="h-4 flex-1 rounded-md bg-white/8" />
        </div>
      </div>
    </div>
  );
}

function LightThemePreview() {
  return (
    <div className="app-settings-preview-shell border-slate-200/90 bg-[#f9fbff] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="border-b border-slate-200/80 px-2.5 py-2">
        <div className="h-1.5 w-10 rounded-full bg-blue-500/72" />
      </div>
      <div className="space-y-2 px-2.5 py-2.5">
        <div className="h-2 rounded-full bg-slate-300/90" />
        <div className="h-2 w-4/5 rounded-full bg-slate-200/95" />
        <div className="flex gap-1.5">
          <span className="h-4 flex-1 rounded-md bg-blue-100" />
          <span className="h-4 flex-1 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function StandardMotionPreview() {
  return (
    <div className="app-settings-preview-shell border-white/10 bg-[#0b1324] text-white">
      <div className="relative h-full overflow-hidden rounded-[18px]">
        <span className="absolute top-3 left-3 h-2 w-8 rounded-full bg-blue-400/80" />
        <span className="absolute top-6 left-8 h-2 w-12 rounded-full bg-sky-300/60 blur-[1px]" />
        <span className="absolute top-10 left-14 h-2 w-9 rounded-full bg-white/22 blur-[1px]" />
      </div>
    </div>
  );
}

function ReducedMotionPreview() {
  return (
    <div className="app-settings-preview-shell border-white/10 bg-[#0b1324] text-white">
      <div className="flex h-full flex-col justify-center gap-2 px-3">
        <span className="h-2 w-8 rounded-full bg-blue-400/72" />
        <span className="h-2 w-12 rounded-full bg-white/26" />
        <span className="h-2 w-10 rounded-full bg-white/16" />
      </div>
    </div>
  );
}

export const THEME_OPTIONS = [
  {
    value: "default",
    label: "Dark",
    eyebrow: "Low-light",
    description: "Deeper contrast for focus-heavy sessions.",
    details: ["Higher contrast", "Blue accents"],
    preview: <DarkThemePreview />,
    icon: MoonStar,
  },
  {
    value: "light",
    label: "Light",
    eyebrow: "Daylight",
    description: "Brighter canvas with softer contrast edges.",
    details: ["Airier surface", "Sharper text"],
    preview: <LightThemePreview />,
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
    preview: <StandardMotionPreview />,
    icon: Zap,
  },
  {
    value: "disabled",
    label: "Reduced",
    eyebrow: "Lighter",
    description: "Cuts motion and expensive visual effects for steadier rendering.",
    details: ["Animations off", "Blur off"],
    preview: <ReducedMotionPreview />,
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
