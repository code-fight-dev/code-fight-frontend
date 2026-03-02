import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";

type Props = {
  isElevated: boolean;
  isMenuOpen: boolean;
};

export function HeaderDesktopGuestActions({ isElevated, isMenuOpen }: Props) {
  return (
    <>
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
          "hidden rounded-xl px-4 transition-all duration-300 sm:inline-flex lg:px-5",
          isElevated ? "h-9 text-[13px]" : "h-10 text-[14px]",
          isMenuOpen && "sm:pointer-events-none sm:scale-95 sm:opacity-0",
        )}
      >
        Join Now
      </Button>
    </>
  );
}
