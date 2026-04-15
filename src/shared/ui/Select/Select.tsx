"use client";

import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/cn";
import { SelectOptionRow } from "./SelectOptionRow";
import {
  SELECT_LISTBOX_SIZE_CLASS_NAMES,
  SELECT_SURFACE_CLASS_NAMES,
  SELECT_TRIGGER_CLASS_NAME,
  SELECT_TRIGGER_SIZE_CLASS_NAMES,
} from "./styles";
import type { SelectOption, SelectProps } from "./types";
import { useSelectListboxPosition } from "./useSelectListboxPosition";
import { getNextEnabledIndex } from "./utils";

export function Select<T extends string = string>({
  "aria-label": ariaLabel,
  className,
  controlSize = "md",
  disabled,
  name,
  onBlur,
  onKeyDown,
  onValueChange,
  options,
  placeholder,
  placeholderValue = "" as T,
  surface = "app",
  value,
  ...props
}: SelectProps<T>) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectOptions = useMemo(
    () =>
      placeholder
        ? [{ value: placeholderValue, label: placeholder }, ...options]
        : [...options],
    [options, placeholder, placeholderValue],
  );
  const selectedIndex = useMemo(
    () => selectOptions.findIndex((option) => option.value === value),
    [selectOptions, value],
  );
  const selectedOption = selectedIndex >= 0 ? selectOptions[selectedIndex] : null;
  const selectedLabel = selectedOption?.label ?? placeholder;
  const isPlaceholderSelected =
    Boolean(placeholder) && selectedOption?.value === placeholderValue;
  const [activeIndex, setActiveIndex] = useState(() =>
    selectedIndex >= 0 ? selectedIndex : getNextEnabledIndex(selectOptions, 0, 1),
  );

  const getPreferredActiveIndex = () =>
    selectedIndex >= 0 ? selectedIndex : getNextEnabledIndex(selectOptions, 0, 1);

  const closeListbox = useCallback(() => setIsOpen(false), []);
  const listboxStyle = useSelectListboxPosition({
    isOpen,
    listboxRef,
    onRequestClose: closeListbox,
    triggerRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!rootRef.current?.contains(target) && !listboxRef.current?.contains(target)) {
        closeListbox();
      }
    }

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        closeListbox();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [closeListbox, isOpen]);

  const selectOption = (option: SelectOption<T>) => {
    if (option.disabled) {
      return;
    }

    onValueChange(option.value);
    closeListbox();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      const direction = event.key === "ArrowDown" ? 1 : -1;
      const fallbackIndex = direction === 1 ? 0 : selectOptions.length - 1;
      const nextIndex = getNextEnabledIndex(
        selectOptions,
        activeIndex >= 0 ? activeIndex + direction : fallbackIndex,
        direction,
      );

      setIsOpen(true);
      setActiveIndex(nextIndex);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen && activeIndex >= 0) {
        const activeOption = selectOptions[activeIndex];

        if (activeOption) {
          selectOption(activeOption);
        }

        return;
      }

      setActiveIndex(getPreferredActiveIndex());
      setIsOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <button
        {...props}
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-controls={isOpen ? listboxId : undefined}
        disabled={disabled}
        onBlur={onBlur}
        onClick={() => {
          if (!isOpen) {
            setActiveIndex(getPreferredActiveIndex());
          }

          setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          SELECT_TRIGGER_CLASS_NAME,
          SELECT_TRIGGER_SIZE_CLASS_NAMES[controlSize],
          SELECT_SURFACE_CLASS_NAMES[surface],
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selectedOption && !isPlaceholderSelected
              ? "text-(--app-input-text)"
              : "text-(--app-input-placeholder)",
          )}
        >
          {selectedLabel}
        </span>

        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-(--app-input-icon) transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              style={listboxStyle}
              className={cn(
                "app-popover fixed z-50 overflow-y-auto border",
                SELECT_LISTBOX_SIZE_CLASS_NAMES[controlSize],
              )}
            >
              {selectOptions.map((option, index) => (
                <SelectOptionRow
                  key={option.value}
                  controlSize={controlSize}
                  isActive={option.value === value}
                  isFocused={index === activeIndex}
                  option={option}
                  onMouseEnter={() => setActiveIndex(index)}
                  onSelect={selectOption}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
