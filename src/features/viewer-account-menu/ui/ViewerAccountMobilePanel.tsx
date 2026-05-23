import type { Viewer } from "@/entities/viewer";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";
import {
  getViewerProfileHref,
  VIEWER_SETTINGS_HREF,
} from "../model/getViewerProfileHref";
import { VIEWER_ACCOUNT_MENU_ITEMS } from "../model/items";

type Props = {
  isOpen: boolean;
  viewer: Viewer;
  isSigningOut: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function ViewerAccountMobilePanel({
  isOpen,
  viewer,
  isSigningOut,
  onClose,
  onSignOut,
}: Props) {
  const profileHref = getViewerProfileHref(viewer.username);

  return (
    <div
      className={cn(
        "grid gap-3 transition-all duration-300",
        isOpen ? "transform-none opacity-100" : "translate-y-4 opacity-0",
      )}
      style={{ transitionDelay: isOpen ? "220ms" : "0ms" }}
    >
      <div className="app-overlay-card rounded-3xl px-4 py-4">
        <div className="font-accent text-[11px] tracking-[0.18em] text-blue-300/72 uppercase">
          Signed In
        </div>
        <div className="mt-2 text-[1rem] font-medium tracking-[-0.03em] text-(--app-text-strong)">
          {viewer.username}
        </div>
        <div className="mt-1 text-[14px] tracking-[-0.03em] text-(--app-text-soft)">
          {viewer.email}
        </div>
      </div>

      <div className="grid gap-2">
        {VIEWER_ACCOUNT_MENU_ITEMS.map((item) => {
          const isSignOutAction = item.id === "sign-out";
          const isProfileLink = item.id === "my-profile";
          const isSettingsLink = item.id === "settings";

          if (item.disabled) {
            return (
              <Button
                key={item.id}
                type="button"
                variant="secondary"
                disabled
                className="min-h-13 justify-start rounded-2xl px-4 py-3 text-[14px] text-(--app-text-faint) transition-all duration-300"
              >
                {item.label}
              </Button>
            );
          }

          if (isProfileLink) {
            return (
              <Button
                key={item.id}
                href={profileHref}
                variant="secondary"
                onClick={onClose}
                className="min-h-13 justify-start rounded-2xl px-4 py-3 text-[14px] transition-all duration-300"
              >
                {item.label}
              </Button>
            );
          }

          if (isSettingsLink) {
            return (
              <Button
                key={item.id}
                href={VIEWER_SETTINGS_HREF}
                variant="secondary"
                onClick={onClose}
                className="min-h-13 justify-start rounded-2xl px-4 py-3 text-[14px] transition-all duration-300"
              >
                {item.label}
              </Button>
            );
          }

          return (
            <Button
              key={item.id}
              type="button"
              variant="secondary"
              disabled={isSigningOut}
              onClick={() => {
                onClose();
                void onSignOut();
              }}
              className="min-h-13 justify-start rounded-2xl px-4 py-3 text-[14px] transition-all duration-300"
            >
              {isSignOutAction && isSigningOut ? "Signing Out..." : item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
