import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";

type Props = {
  isMenuOpen: boolean;
  onClose: () => void;
};

export function HeaderMobileGuestPanel({ isMenuOpen, onClose }: Props) {
  return (
    <div
      className={cn(
        "grid gap-3 transition-all duration-300 sm:grid-cols-2",
        isMenuOpen ? "transform-none opacity-100" : "translate-y-4 opacity-0",
      )}
      style={{ transitionDelay: isMenuOpen ? "220ms" : "0ms" }}
    >
      <Button
        href="/signin"
        onClick={onClose}
        variant="secondary"
        className="min-h-13 rounded-2xl px-4 py-3 text-[14px] transition-all duration-300"
      >
        Sign In
      </Button>
      <Button
        href="/signup"
        onClick={onClose}
        className="min-h-13 rounded-2xl px-4 py-3 text-[14px] transition-all duration-300"
      >
        Join Now
      </Button>
    </div>
  );
}
