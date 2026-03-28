"use client";

import { useId, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { PreferenceOption } from "@/features/preferences/model/definitions";
import { PreferenceOptionPreview } from "@/features/preferences/ui/PreferenceOptionPreview";
import { cn } from "@/shared/lib/cn";

const CURRENT_LABEL = "Current";
const APPLY_LABEL = "Apply";
const SELECTED_LABEL = "Selected";

const BASE_BADGE_CLASS_NAME =
  "inline-flex items-center rounded-full border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) text-(--app-text-soft) uppercase";
const CURRENT_BADGE_CLASS_NAME = `${BASE_BADGE_CLASS_NAME} w-fit self-start gap-2 px-3 py-1.5 text-[11px] font-medium tracking-[0.16em] sm:self-auto`;
const OPTION_EYEBROW_CLASS_NAME = `${BASE_BADGE_CLASS_NAME} px-2 py-0.75 text-[9px] font-medium tracking-[0.14em] sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.16em]`;
const OPTION_DETAIL_CLASS_NAME = `${BASE_BADGE_CLASS_NAME} px-2 py-0.75 text-[9px] font-medium tracking-[0.12em] sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]`;
const OPTION_CARD_CLASS_NAME =
  "app-settings-option group block cursor-pointer px-3.5 py-3.5 text-left transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400/40 focus-within:outline-none focus-within:ring-inset sm:px-6 sm:py-5";
const OPTION_CONTENT_LAYOUT_CLASS_NAME =
  "flex flex-col gap-3.5 sm:gap-5 lg:flex-row lg:items-center lg:gap-6";
const OPTION_ACTIONS_CLASS_NAME =
  "flex w-full items-end justify-end gap-3 sm:justify-between lg:ml-auto lg:w-auto lg:justify-end";
const OPTION_ACTION_BUTTON_CLASS_NAME =
  "inline-flex min-w-18 items-center justify-center rounded-full border px-2.5 py-1.5 text-[11px] font-medium tracking-[0.02em] transition-all duration-200 sm:min-w-22 sm:px-3 sm:text-[12px]";
const OPTION_ACTION_ICON_CLASS_NAME =
  "inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 sm:h-9 sm:w-9";

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
      <PreferenceSectionHeader
        titleId={titleId}
        descriptionId={descriptionId}
        eyebrow={eyebrow}
        title={title}
        description={description}
        currentLabel={currentLabel}
      />

      <div
        role="radiogroup"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="app-settings-section mt-5 overflow-hidden rounded-[28px]"
      >
        {options.map((option, index) => (
          <PreferenceOptionCard
            key={option.value}
            name={name}
            option={option}
            isActive={currentValue === option.value}
            withTopBorder={index !== 0}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

type PreferenceSectionHeaderProps = Readonly<{
  currentLabel: string;
  description: string;
  descriptionId: string;
  eyebrow: string;
  title: string;
  titleId: string;
}>;

function PreferenceSectionHeader({
  currentLabel,
  description,
  descriptionId,
  eyebrow,
  title,
  titleId,
}: PreferenceSectionHeaderProps) {
  return (
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

      <Badge className={CURRENT_BADGE_CLASS_NAME}>
        {CURRENT_LABEL}
        <span className="text-(--app-text-strong)">{currentLabel}</span>
      </Badge>
    </div>
  );
}

type PreferenceOptionCardProps<T extends string> = Readonly<{
  isActive: boolean;
  name: `${string}-preference`;
  onSelect: (value: T) => void;
  option: PreferenceOption<T>;
  withTopBorder: boolean;
}>;

function PreferenceOptionCard<T extends string>({
  isActive,
  name,
  onSelect,
  option,
  withTopBorder,
}: PreferenceOptionCardProps<T>) {
  const Icon = option.icon;

  const handleChange = () => {
    if (!isActive) {
      onSelect(option.value);
    }
  };

  return (
    <label
      className={cn(
        OPTION_CARD_CLASS_NAME,
        withTopBorder && "border-t border-(--app-settings-divider)",
        isActive && "app-settings-option-active",
      )}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={isActive}
        onChange={handleChange}
        className="sr-only"
      />

      <div className={OPTION_CONTENT_LAYOUT_CLASS_NAME}>
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <div
            className={cn(
              "app-option-icon transition-all duration-200",
              isActive && "border-blue-400/30 bg-blue-500/16 text-blue-400",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="text-[15px] font-semibold tracking-[-0.04em] text-(--app-text-strong) sm:text-[17px]">
                {option.label}
              </div>
              <Badge className={OPTION_EYEBROW_CLASS_NAME}>{option.eyebrow}</Badge>
            </div>

            <p className="mt-1 text-[13px] leading-[1.55] tracking-[-0.03em] text-(--app-text-muted) sm:text-[15px] sm:leading-[1.65]">
              {option.description}
            </p>

            <PreferenceDetailList details={option.details} />
          </div>
        </div>

        <PreferenceOptionActions isActive={isActive}>
          <PreferenceOptionPreview variant={option.previewVariant} />
        </PreferenceOptionActions>
      </div>
    </label>
  );
}

type PreferenceDetailListProps = Readonly<{
  details: readonly string[];
}>;

function PreferenceDetailList({ details }: PreferenceDetailListProps) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
      {details.map((detail) => (
        <Badge key={detail} className={OPTION_DETAIL_CLASS_NAME}>
          {detail}
        </Badge>
      ))}
    </div>
  );
}

type PreferenceOptionActionsProps = Readonly<{
  children: ReactNode;
  isActive: boolean;
}>;

function PreferenceOptionActions({ children, isActive }: PreferenceOptionActionsProps) {
  return (
    <div className={OPTION_ACTIONS_CLASS_NAME}>
      <div className="hidden shrink-0 sm:block">{children}</div>
      <div className="flex items-center gap-2.5 self-end sm:gap-3">
        <div
          className={cn(
            OPTION_ACTION_BUTTON_CLASS_NAME,
            isActive
              ? "border-blue-400/24 bg-blue-500/14 text-blue-400"
              : "border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) text-(--app-text-muted)",
          )}
        >
          {isActive ? SELECTED_LABEL : APPLY_LABEL}
        </div>

        <div
          className={cn(
            OPTION_ACTION_ICON_CLASS_NAME,
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
        </div>
      </div>
    </div>
  );
}

type BadgeProps = Readonly<{
  children: ReactNode;
  className: string;
}>;

function Badge({ children, className }: BadgeProps) {
  return <span className={className}>{children}</span>;
}
