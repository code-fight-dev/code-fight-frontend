import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import type { Viewer } from "@/entities/viewer";

type Props = {
  isMenuOpen: boolean;
  viewer: Viewer;
  isSigningOut: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function HeaderMobileViewerPanel({
  isMenuOpen,
  viewer,
  isSigningOut,
  onClose,
  onSignOut,
}: Props) {
  return (
    <div
      className={cn(
        "grid gap-3 transition-all duration-300",
        isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
      style={{ transitionDelay: isMenuOpen ? "220ms" : "0ms" }}
    >
      <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4">
        <div className="font-accent text-[11px] tracking-[0.18em] text-blue-300/72 uppercase">
          Signed In
        </div>
        <div className="mt-2 text-[1rem] font-medium tracking-[-0.03em] text-white/88">
          {viewer.username}
        </div>
        <div className="mt-1 text-[14px] tracking-[-0.03em] text-white/42">
          {viewer.email}
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={isSigningOut}
        onClick={() => {
          onClose();
          void onSignOut();
        }}
        className="min-h-13 rounded-2xl px-4 py-3 text-[14px] transition-all duration-300"
      >
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </Button>
    </div>
  );
}
