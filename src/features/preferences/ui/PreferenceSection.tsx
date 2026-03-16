"use client";

import { useId } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PreferenceOption } from "../model/settingsSections";

type Props<T extends string> = Readonly<{
  name: `${string}-preference`;
  eyebrow: string;
  title: string;
  description: string;
  options: readonly PreferenceOption<T>[];
  currentValue: T;
  currentLabel: string;
  onSelect: (value: T) => void;
}>;

export function PreferenceSection<T extends string>({
  name,
  eyebrow,
  title,
  description,
  options,
  currentValue,
  currentLabel,
  onSelect,
}: Props<T>) {
  const sectionId = useId();
  const titleId = `${sectionId}-${name}-title`;
  const descriptionId = `${sectionId}-${name}-description`;

  return (
    <section className="scroll-mt-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-accent text-[12px] tracking-[0.2em] text-blue-400/78 uppercase">
            {eyebrow}
          </div>
          <h2
            id={titleId}
            className="mt-3 text-[1.55rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[1.85rem]"
          >
            {title}
          </h2>
          <p
            id={descriptionId}
            className="mt-2 max-w-2xl text-[15px] leading-[1.68] tracking-[-0.03em] text-(--app-text-muted) sm:text-[16px]"
          >
            {description}
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] text-(--app-text-soft) uppercase">
          Current
          <span className="text-(--app-text-strong)">{currentLabel}</span>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="app-settings-section mt-5 overflow-hidden rounded-[28px]"
      >
        {options.map((option, index) => {
          const Icon = option.icon;
          const isActive = currentValue === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                "app-settings-option group block cursor-pointer px-4 py-4 text-left transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400/40 focus-within:outline-none focus-within:ring-inset sm:px-6 sm:py-5",
                index !== 0 && "border-t border-(--app-settings-divider)",
                isActive && "app-settings-option-active",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isActive}
                onChange={() => {
                  if (!isActive) {
                    onSelect(option.value);
                  }
                }}
                className="sr-only"
              />

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span
                    className={cn(
                      "app-option-icon transition-all duration-200",
                      isActive && "border-blue-400/30 bg-blue-500/16 text-blue-400",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[16px] font-semibold tracking-[-0.04em] text-(--app-text-strong) sm:text-[17px]">
                        {option.label}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] text-(--app-text-soft) uppercase">
                        {option.eyebrow}
                      </span>
                    </span>

                    <span className="mt-1 block text-[14px] leading-[1.65] tracking-[-0.03em] text-(--app-text-muted) sm:text-[15px]">
                      {option.description}
                    </span>

                    <span className="mt-3 flex flex-wrap gap-2">
                      {option.details.map((detail) => (
                        <span
                          key={detail}
                          className="inline-flex items-center rounded-full border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-(--app-text-soft) uppercase"
                        >
                          {detail}
                        </span>
                      ))}
                    </span>
                  </span>
                </div>

                <span className="flex items-center justify-between gap-4 lg:ml-auto lg:justify-end">
                  <span className="shrink-0">{option.preview}</span>

                  <span
                    className={cn(
                      "inline-flex min-w-22 items-center justify-center rounded-full border px-3 py-1.5 text-[12px] font-medium tracking-[0.02em] transition-all duration-200",
                      isActive
                        ? "border-blue-400/24 bg-blue-500/14 text-blue-400"
                        : "border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) text-(--app-text-muted)",
                    )}
                  >
                    {isActive ? "Selected" : "Apply"}
                  </span>

                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200",
                      isActive
                        ? "border-blue-400/24 bg-blue-500/14 text-blue-400"
                        : "border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) text-(--app-text-faint) group-hover:text-(--app-text-muted)",
                    )}
                  >
                    {isActive ? (
                      <Check className="h-4 w-4" strokeWidth={2.4} />
                    ) : (
                      <ArrowRight className="h-4 w-4" strokeWidth={2.1} />
                    )}
                  </span>
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
