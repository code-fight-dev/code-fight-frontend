import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import { HEADER_NAV } from "../model/nav";

type Props = {
  isMenuOpen: boolean;
  onClose: () => void;
};

export function HeaderMobileOverlay({ isMenuOpen, onClose }: Props) {
  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden transition-[opacity,visibility] duration-300 lg:hidden",
        isMenuOpen
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-[rgba(5,9,22,0.92)] backdrop-blur-2xl" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.18),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(59,130,246,0.12),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(29,78,216,0.14),transparent_24%)]"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-[20%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.06),transparent)]"
      />
      <div
        aria-hidden
        className="absolute top-[18%] right-[-10%] h-72 w-72 rounded-full bg-[#2563eb]/16 blur-3xl"
      />

      <div className="pointer-events-auto relative flex min-h-dvh flex-col px-4 pt-23 pb-6 sm:px-5 sm:pt-25 sm:pb-8">
        <div
          className={cn(
            "transition-all duration-300",
            isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <div className="font-accent text-[11px] tracking-[0.24em] text-blue-300/72 uppercase">
            Navigation
          </div>

          <nav className="mt-5 grid gap-3 sm:mt-6">
            {HEADER_NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "font-accent rounded-[28px] border border-white/8 bg-white/3 px-5 py-4 text-[1.55rem] font-medium tracking-[-0.05em] text-white/88 shadow-[0_18px_40px_rgba(3,7,18,0.18)] transition-[transform,opacity,border-color,background-color,color] duration-300 hover:border-blue-400/24 hover:bg-blue-500/10 hover:text-blue-50 sm:px-6 sm:py-5 sm:text-[1.9rem]",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                style={{
                  transitionDelay: isMenuOpen ? `${80 + index * 45}ms` : "0ms",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/8 pt-5 sm:pt-6">
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
        </div>
      </div>
    </div>
  );
}
