"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib/cn";

type SliderFieldProps = Readonly<{
  className?: string;
  description: string;
  inputLabel?: string;
  label: string;
  max: number;
  min: number;
  onValueChange: (value: number) => void;
  step?: number;
  value: number;
}>;

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function alignValueToStep(value: number, min: number, step: number) {
  const precision = step.toString().split(".")[1]?.length ?? 0;
  const aligned = Math.round((value - min) / step) * step + min;

  return Number(aligned.toFixed(precision));
}

export function SliderField({
  className,
  description,
  inputLabel,
  label,
  max,
  min,
  onValueChange,
  step = 1,
  value,
}: SliderFieldProps) {
  const inputId = useId();
  const shouldSkipNextCommitRef = useRef(false);
  const [draftValue, setDraftValue] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);
  const progress = ((value - min) / (max - min)) * 100;
  const displayedValue = isEditing ? draftValue : String(value);

  function commitDraftValue() {
    const parsedValue = Number(draftValue);

    if (!Number.isFinite(parsedValue)) {
      setDraftValue(String(value));
      return;
    }

    const nextValue = alignValueToStep(clampValue(parsedValue, min, max), min, step);

    setDraftValue(String(nextValue));
    onValueChange(nextValue);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      shouldSkipNextCommitRef.current = true;
      setDraftValue(String(value));
      event.currentTarget.blur();
    }
  }

  return (
    <div className={cn("app-settings-section rounded-2xl p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-(--app-text-strong)"
          >
            {label}
          </label>
          <div className="mt-1 text-xs leading-5 text-(--app-text-muted)">
            {description}
          </div>
        </div>

        <div className="shrink-0">
          <label className="sr-only" htmlFor={`${inputId}-number`}>
            {inputLabel ?? `${label} value`}
          </label>
          <input
            id={`${inputId}-number`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={displayedValue}
            onBlur={() => {
              if (shouldSkipNextCommitRef.current) {
                shouldSkipNextCommitRef.current = false;
                setIsEditing(false);
                setDraftValue(String(value));
                return;
              }

              setIsEditing(false);
              commitDraftValue();
            }}
            onChange={(event) => setDraftValue(event.target.value)}
            onFocus={() => {
              setDraftValue(String(value));
              setIsEditing(true);
            }}
            onKeyDown={handleInputKeyDown}
            className="app-slider-number h-8 w-13 rounded-xl text-center text-xs font-semibold outline-none"
          />
        </div>
      </div>

      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onValueChange(Number(event.target.value))}
        className="app-slider-input mt-4 w-full"
        style={{ "--app-slider-progress": `${progress}%` } as CSSProperties}
      />
    </div>
  );
}
