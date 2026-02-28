import { Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";

type Props = {
  isElevated: boolean;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
};

export function HeaderActions({ isElevated, isMenuOpen, onMenuToggle }: Props) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
      <Button
        href="/signin"
        variant="ghost"
        className={cn(
          "hidden rounded-lg px-3 py-2 transition-all duration-300 lg:inline-flex",
          isElevated ? "text-[13px]" : "text-[14px]",
        )}
      >
        Sign In
      </Button>

      <Button
        href="/signup"
        className={cn(
          "hidden rounded-xl border-[#4f78ff]/70 bg-[#3466f6] px-4 transition-all duration-300 sm:inline-flex lg:px-5",
          isElevated ? "h-9 text-[13px]" : "h-10 text-[14px]",
          isMenuOpen && "sm:pointer-events-none sm:scale-95 sm:opacity-0",
        )}
      >
        Join Now
      </Button>

      <IconButton
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={onMenuToggle}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.03)_100%)] text-white/84 shadow-[0_14px_34px_rgba(3,7,18,0.28)] transition-all duration-300 hover:border-blue-400/24 hover:bg-blue-500/10 hover:text-blue-50 lg:hidden",
          isElevated &&
            "border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.04)_100%)]",
          isMenuOpen &&
            "border-blue-400/26 bg-blue-500/12 text-blue-50 shadow-[0_16px_38px_rgba(37,99,235,0.18)]",
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
