import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { SELECT_OPTION_SIZE_CLASS_NAMES } from "./styles";
import type { SelectControlSize, SelectOption } from "./types";

type SelectOptionRowProps<T extends string> = Readonly<{
  controlSize: SelectControlSize;
  isActive: boolean;
  isFocused: boolean;
  onMouseEnter: () => void;
  onSelect: (option: SelectOption<T>) => void;
  option: SelectOption<T>;
}>;

export function SelectOptionRow<T extends string>({
  controlSize,
  isActive,
  isFocused,
  onMouseEnter,
  onSelect,
  option,
}: SelectOptionRowProps<T>) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isActive}
      disabled={option.disabled}
      onClick={() => onSelect(option)}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex w-full items-center justify-between gap-3 text-left transition-colors duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-45",
        SELECT_OPTION_SIZE_CLASS_NAMES[controlSize],
        isFocused || isActive
          ? "bg-(--app-option-active-bg) text-(--app-text-strong)"
          : "text-(--app-text-muted) hover:bg-(--app-settings-row-hover) hover:text-(--app-text-strong)",
      )}
    >
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {isActive ? (
        <Check aria-hidden className="h-4 w-4 shrink-0 text-blue-400" strokeWidth={2.3} />
      ) : null}
    </button>
  );
}
