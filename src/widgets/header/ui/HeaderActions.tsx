import { Menu, X } from "lucide-react";
import type { Viewer } from "@/entities/viewer";
import { ViewerAccountDesktopMenu } from "@/features/viewer-account-menu";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/IconButton";
import { HeaderDesktopGuestActions } from "./HeaderDesktopGuestActions";

type Props = {
  isElevated: boolean;
  isMenuOpen: boolean;
  viewer: Viewer | null;
  isLoading: boolean;
  isSigningOut: boolean;
  onSignOut: () => void;
  onMenuToggle: () => void;
};

export function HeaderActions({
  isElevated,
  isMenuOpen,
  viewer,
  isLoading,
  isSigningOut,
  onSignOut,
  onMenuToggle,
}: Props) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
      {isLoading ? (
        <div className="hidden h-10 w-44 rounded-full border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) sm:inline-flex" />
      ) : viewer ? (
        <ViewerAccountDesktopMenu
          isElevated={isElevated}
          isNavigationOpen={isMenuOpen}
          viewer={viewer}
          isSigningOut={isSigningOut}
          onSignOut={onSignOut}
        />
      ) : (
        <HeaderDesktopGuestActions isElevated={isElevated} isMenuOpen={isMenuOpen} />
      )}

      <IconButton
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={onMenuToggle}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) text-(--app-control-secondary-text) shadow-[0_14px_34px_rgba(3,7,18,0.18)] transition-all duration-300 hover:border-blue-400/24 hover:bg-blue-500/10 hover:text-(--app-text-strong) lg:hidden",
          isElevated && "border-(--app-control-secondary-hover-border)",
          isMenuOpen &&
            "border-blue-400/26 bg-blue-500/12 text-(--app-text-strong) shadow-[0_16px_38px_rgba(37,99,235,0.18)]",
        )}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Menu
            aria-hidden
            strokeWidth={2}
            className={cn(
              "absolute h-4.5 w-4.5 transition-all duration-300",
              isMenuOpen
                ? "scale-75 -rotate-90 opacity-0"
                : "scale-100 rotate-0 opacity-100",
            )}
          />
          <X
            aria-hidden
            strokeWidth={2.1}
            className={cn(
              "absolute h-4.5 w-4.5 transition-all duration-300",
              isMenuOpen
                ? "scale-100 rotate-0 opacity-100"
                : "scale-75 rotate-90 opacity-0",
            )}
          />
        </span>
      </IconButton>
    </div>
  );
}
