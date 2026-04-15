"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { SliderField } from "@/shared/ui/SliderField";
import { Select, type SelectOption } from "@/shared/ui/Select";

type InfoTooltipProps = Readonly<{
  content: string;
}>;

function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        className="inline-flex size-5 items-center justify-center rounded-full border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) text-[11px] font-bold text-(--app-text-muted) transition hover:text-(--app-text-strong) focus:ring-2 focus:ring-(--app-option-border) focus:outline-none"
      >
        i
      </button>

      <span className="app-popover pointer-events-none absolute top-full left-1/2 z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg px-3 py-2 text-left text-xs leading-5 text-(--app-text-strong) opacity-0 transition duration-150 group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100">
        {content}
      </span>
    </span>
  );
}

type FieldShellProps = Readonly<{
  children: ReactNode;
  asLabel?: boolean;
  className?: string;
}>;

function FieldShell({ asLabel = false, children, className }: FieldShellProps) {
  const fieldClassName = cn("app-settings-section block rounded-2xl p-4", className);

  return asLabel ? (
    <label className={fieldClassName}>{children}</label>
  ) : (
    <div className={fieldClassName}>{children}</div>
  );
}

type SelectFieldProps<T extends string> = Readonly<{
  description: string;
  hint?: string;
  label: string;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  value: T;
  className?: string;
}>;

export function SelectField<T extends string>({
  className,
  description,
  hint,
  label,
  onChange,
  options,
  value,
}: SelectFieldProps<T>) {
  return (
    <FieldShell className={className}>
      <div className="flex items-start gap-2">
        <div className="text-sm font-semibold text-(--app-text-strong)">{label}</div>
        {hint ? <InfoTooltip content={hint} /> : null}
      </div>

      <div className="mt-1 text-xs leading-5 text-(--app-text-muted)">{description}</div>

      <Select
        aria-label={label}
        value={value}
        options={options}
        onValueChange={onChange}
        className="mt-4 border-(--app-settings-section-border)"
      />
    </FieldShell>
  );
}

export { SliderField };

type ToggleFieldProps = Readonly<{
  description: string;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}>;

export function ToggleField({ description, label, onChange, value }: ToggleFieldProps) {
  return (
    <div className="app-settings-section rounded-2xl p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-(--app-text-strong)">{label}</div>
          <div className="mt-1 text-xs leading-5 text-(--app-text-muted)">
            {description}
          </div>
        </div>

        <div
          className="app-editor-toggle-control"
          role="group"
          aria-label={`${label} toggle`}
        >
          <ToggleButton isActive={value} onClick={() => onChange(true)}>
            On
          </ToggleButton>
          <ToggleButton isActive={!value} onClick={() => onChange(false)}>
            Off
          </ToggleButton>
        </div>
      </div>
    </div>
  );
}

type ToggleButtonProps = Readonly<{
  children: ReactNode;
  isActive: boolean;
  onClick: () => void;
}>;

function ToggleButton({ children, isActive, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "app-editor-toggle-button rounded-lg px-3 py-2 text-xs font-semibold",
        isActive && "app-editor-toggle-button-active",
      )}
    >
      {children}
    </button>
  );
}
