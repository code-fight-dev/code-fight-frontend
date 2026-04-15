import type { SelectControlSize, SelectSurface } from "./types";

export const SELECT_TRIGGER_CLASS_NAME =
  "group relative flex w-full items-center justify-between gap-3 border text-left outline-none transition-[border-color,box-shadow,background-color,color] duration-200 disabled:cursor-not-allowed disabled:opacity-55";

export const SELECT_TRIGGER_SIZE_CLASS_NAMES: Record<SelectControlSize, string> = {
  sm: "h-9 rounded-lg px-3 text-[13px]",
  md: "h-11 rounded-lg px-3.5 text-[14px]",
  lg: "h-14.5 rounded-2xl px-4 text-[15px] tracking-[-0.03em]",
};

export const SELECT_LISTBOX_SIZE_CLASS_NAMES: Record<SelectControlSize, string> = {
  sm: "rounded-lg py-1 text-[13px]",
  md: "rounded-lg py-1.5 text-[14px]",
  lg: "rounded-2xl py-2 text-[15px] tracking-[-0.03em]",
};

export const SELECT_OPTION_SIZE_CLASS_NAMES: Record<SelectControlSize, string> = {
  sm: "px-3 py-2",
  md: "px-3.5 py-2.5",
  lg: "px-4 py-3",
};

export const SELECT_SURFACE_CLASS_NAMES: Record<SelectSurface, string> = {
  app: "app-input-surface focus-visible:border-(--app-input-focus-border) focus-visible:bg-(--app-surface-input-focus) focus-visible:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.12)]",
  challenge:
    "challenge-control challenge-focus-ring focus-visible:border-(--app-input-focus-border) focus-visible:bg-(--app-surface-input-focus)",
};
