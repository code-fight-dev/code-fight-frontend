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
        isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
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
        className="min-h-13 rounded-2xl border-[#4f78ff]/70 bg-[#3466f6] px-4 py-3 text-[14px] shadow-[0_14px_30px_rgba(37,99,235,0.24)] transition-all duration-300 hover:border-[#79a0ff] hover:bg-[#3d70ff] hover:shadow-[0_18px_38px_rgba(37,99,235,0.34)]"
      >
        Join Now
      </Button>
    </div>
  );
}
