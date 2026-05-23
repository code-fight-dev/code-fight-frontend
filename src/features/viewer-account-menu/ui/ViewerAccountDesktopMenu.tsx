"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { Viewer } from "@/entities/viewer";
import { cn } from "@/shared/lib/cn";
import {
  getViewerProfileHref,
  VIEWER_SETTINGS_HREF,
} from "../model/getViewerProfileHref";
import { VIEWER_ACCOUNT_MENU_ITEMS } from "../model/items";

type Props = {
  isElevated: boolean;
  isNavigationOpen: boolean;
  viewer: Viewer;
  isSigningOut: boolean;
  onSignOut: () => void;
};

export function ViewerAccountDesktopMenu({
  isElevated,
  isNavigationOpen,
  viewer,
  isSigningOut,
  onSignOut,
}: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isDropdownVisible = isDropdownOpen && !isNavigationOpen && !isSigningOut;
  const profileHref = getViewerProfileHref(viewer.username);

  useEffect(() => {
    if (!isDropdownVisible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownVisible]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative hidden lg:block",
        isNavigationOpen && "pointer-events-none scale-95 opacity-0",
      )}
    >
      <button
        type="button"
        aria-controls={dropdownId}
        aria-expanded={isDropdownVisible}
        aria-haspopup="menu"
        onClick={() => setIsDropdownOpen((currentValue) => !currentValue)}
        className={cn(
          "font-accent hidden items-center gap-2 rounded-full border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) px-4 text-(--app-control-ghost-text) shadow-[0_14px_30px_rgba(3,7,18,0.12)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-blue-400/24 hover:bg-blue-500/10 hover:text-(--app-text-strong) focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-focus-ring-offset) lg:inline-flex",
          isElevated ? "h-9 text-[13px]" : "h-10 text-[14px]",
          isDropdownVisible &&
            "border-blue-400/28 bg-blue-500/12 text-(--app-text-strong) shadow-[0_16px_38px_rgba(37,99,235,0.16)]",
        )}
      >
        <span className="max-w-40 truncate">{viewer.username}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isDropdownVisible && "rotate-180",
          )}
        />
      </button>

      <div
        id={dropdownId}
        role="menu"
        aria-label="Viewer menu"
        className={cn(
          "app-popover absolute top-[calc(100%+0.75rem)] right-0 z-20 min-w-56 overflow-hidden rounded-3xl p-2.5 transition-all duration-200",
          isDropdownVisible
            ? "pointer-events-auto transform-none opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="mb-2 border-b border-(--app-popover-divider) px-3.5 pt-2.5 pb-3.5">
          <div className="font-accent text-[11px] tracking-[0.18em] text-blue-300/72 uppercase">
            Signed In
          </div>
          <div className="mt-2 text-[15px] font-medium tracking-[-0.03em] text-(--app-text-strong)">
            {viewer.username}
          </div>
          <div className="mt-1 text-[13px] tracking-[-0.03em] text-(--app-text-soft)">
            {viewer.email}
          </div>
        </div>

        <div className="app-popover-section grid gap-1 rounded-[22px] p-1.5">
          {VIEWER_ACCOUNT_MENU_ITEMS.map((item) => {
            const isSignOutAction = item.id === "sign-out";
            const isProfileLink = item.id === "my-profile";
            const isSettingsLink = item.id === "settings";
            const isDisabled = item.disabled || (isSignOutAction && isSigningOut);
            const itemClassName = cn(
              "font-accent flex min-h-11 items-center rounded-[16px] px-3.5 text-left text-[14px] font-medium tracking-[-0.03em] transition-all duration-200",
              item.disabled
                ? "cursor-not-allowed text-[var(--app-text-faint)]"
                : "text-[var(--app-text-strong)] hover:bg-blue-500/10 hover:text-[var(--app-text-strong)] focus:outline-none focus-visible:bg-blue-500/12 focus-visible:text-[var(--app-text-strong)]",
              isSignOutAction && !isSigningOut && "text-blue-500",
            );

            if (isProfileLink && !isDisabled) {
              return (
                <Link
                  key={item.id}
                  href={profileHref}
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                  className={itemClassName}
                >
                  {item.label}
                </Link>
              );
            }

            if (isSettingsLink && !isDisabled) {
              return (
                <Link
                  key={item.id}
                  href={VIEWER_SETTINGS_HREF}
                  role="menuitem"
                  onClick={() => setIsDropdownOpen(false)}
                  className={itemClassName}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={isDisabled}
                onClick={() => {
                  if (!isSignOutAction) {
                    return;
                  }

                  setIsDropdownOpen(false);
                  void onSignOut();
                }}
                className={itemClassName}
              >
                {isSignOutAction && isSigningOut ? "Signing Out..." : item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
