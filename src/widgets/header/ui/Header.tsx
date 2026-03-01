"use client";

import { useViewerSession } from "@/entities/viewer";
import { cn } from "@/shared/lib/cn";
import { Logo } from "@/shared/ui/Logo";
import { useHeaderState } from "../model/useHeaderState";
import { HeaderActions } from "./HeaderActions";
import { HeaderBackground } from "./HeaderBackground";
import { HeaderDesktopNav } from "./HeaderDesktopNav";
import { HeaderMobileOverlay } from "./HeaderMobileOverlay";

export function Header() {
  const { isReady, isElevated, isMenuOpen, surfaceStyles, closeMenu, toggleMenu } =
    useHeaderState();
  const { viewer, isLoading, isSigningOut, signOut } = useViewerSession();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="relative z-10">
        <div
          className={cn(
            "pointer-events-auto relative overflow-hidden transition-[margin,transform,opacity,background-color,border-radius,box-shadow,height] duration-500 ease-out",
            isReady ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
            isElevated
              ? "mx-2 mt-2 rounded-[22px] border border-white/10 bg-[rgba(10,15,28,0.82)] shadow-[0_22px_60px_rgba(3,7,18,0.45)] backdrop-blur-xl sm:mx-3 sm:mt-3 sm:rounded-3xl"
              : "mx-0 mt-0 rounded-none border-b border-[#18181B] bg-[rgba(16,22,34,0.8)] backdrop-blur-[6px]",
          )}
        >
          <HeaderBackground isElevated={isElevated} {...surfaceStyles} />

          <div
            className={cn(
              "relative flex items-center justify-between gap-3 px-4 transition-[height,padding] duration-500 sm:px-5 md:px-6 xl:px-8 2xl:px-10",
              isElevated ? "h-17 sm:h-18" : "h-18.5 sm:h-20",
            )}
          >
            <div className="flex min-w-0 items-center">
              <Logo onClick={closeMenu} />
            </div>

            <HeaderDesktopNav isElevated={isElevated} />
            <HeaderActions
              isElevated={isElevated}
              isMenuOpen={isMenuOpen}
              viewer={viewer}
              isLoading={isLoading}
              isSigningOut={isSigningOut}
              onSignOut={signOut}
              onMenuToggle={toggleMenu}
            />
          </div>
        </div>
      </div>

      <HeaderMobileOverlay
        isMenuOpen={isMenuOpen}
        viewer={viewer}
        isSigningOut={isSigningOut}
        onClose={closeMenu}
        onSignOut={signOut}
      />
    </header>
  );
}
