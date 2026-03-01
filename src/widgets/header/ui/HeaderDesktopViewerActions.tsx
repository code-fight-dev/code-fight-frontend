import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import type { Viewer } from "@/entities/viewer";

type Props = {
  isElevated: boolean;
  isMenuOpen: boolean;
  viewer: Viewer;
  isSigningOut: boolean;
  onSignOut: () => void;
};

export function HeaderDesktopViewerActions({
  isElevated,
  isMenuOpen,
  viewer,
  isSigningOut,
  onSignOut,
}: Props) {
  return (
    <>
      <div
        className={cn(
          "font-accent hidden items-center rounded-full border border-white/10 bg-white/[0.04] px-4 text-white/78 shadow-[0_14px_30px_rgba(3,7,18,0.18)] lg:inline-flex",
          isElevated ? "h-9 text-[13px]" : "h-10 text-[14px]",
        )}
      >
        {viewer.username}
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={isSigningOut}
        onClick={onSignOut}
        className={cn(
          "hidden rounded-xl px-4 transition-all duration-300 sm:inline-flex lg:px-5",
          isElevated ? "h-9 text-[13px]" : "h-10 text-[14px]",
          isMenuOpen && "sm:pointer-events-none sm:scale-95 sm:opacity-0",
        )}
      >
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </Button>
    </>
  );
}
