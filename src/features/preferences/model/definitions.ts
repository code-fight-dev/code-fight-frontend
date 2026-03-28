import type { LucideIcon } from "lucide-react";

export type PreferencePreviewVariant =
  | "dark-theme"
  | "light-theme"
  | "standard-motion"
  | "reduced-motion";

export type PreferenceOption<T extends string> = Readonly<{
  value: T;
  label: string;
  eyebrow: string;
  description: string;
  details: readonly string[];
  previewVariant: PreferencePreviewVariant;
  icon: LucideIcon;
}>;

export type PreferenceSectionDefinition<T extends string> = Readonly<{
  name: `${string}-preference`;
  eyebrow: string;
  title: string;
  description: string;
  options: readonly PreferenceOption<T>[];
}>;
