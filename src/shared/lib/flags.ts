import * as FlagIcons from "country-flag-icons/react/3x2";

export type FlagComponent = (typeof FlagIcons)[keyof typeof FlagIcons];

export const flagIcons = FlagIcons as Record<string, FlagComponent>;
