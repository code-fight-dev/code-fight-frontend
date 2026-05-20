import { cn } from "@/shared/lib/cn";
import type { HeaderSurfaceStyles } from "../model/useHeaderState";

type Props = HeaderSurfaceStyles & {
  isElevated: boolean;
};

export function HeaderBackground({
  isElevated,
  leftGlowStyle,
  rightGlowStyle,
  shimmerStyle,
  trailStyle,
}: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        className={cn(
          "app-motion-decorative absolute -top-16 -left-20 h-40 w-72 rounded-full bg-[#2563eb]/12 blur-3xl transition-all duration-500",
          isElevated && "-top-10 h-32 w-56 bg-[#2563eb]/10",
        )}
        style={leftGlowStyle}
      />
      <div
        className={cn(
          "app-motion-decorative absolute -top-24 right-[16%] h-44 w-80 rounded-full bg-[#1d4ed8]/10 blur-3xl transition-all duration-500",
          isElevated && "-top-16 right-[12%] h-32 w-60 bg-[#1d4ed8]/8",
        )}
        style={rightGlowStyle}
      />
      <div
        className="app-motion-decorative absolute inset-y-[-40%] left-[-12%] w-[24%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] blur-3xl transition-opacity duration-500 [html[data-theme='light']_&]:bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.12),transparent)]"
        style={shimmerStyle}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-[inherit] border border-(--app-surface-soft-border) transition-opacity duration-500",
          isElevated ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-(--app-header-border-soft) transition-opacity duration-300",
          isElevated && "opacity-0",
        )}
      />
      <div
        className={cn(
          "app-motion-decorative absolute inset-x-0 -bottom-4.5 h-10 bg-[linear-gradient(180deg,rgba(37,99,235,0.18)_0%,rgba(37,99,235,0.08)_45%,transparent_100%)] blur-xl transition-all duration-500",
          isElevated && "-bottom-2.5 h-8 opacity-60",
        )}
        style={trailStyle}
      />
    </div>
  );
}
