import { Camera, ChevronRight, MapPin, PenSquare, UserRound } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ProfileSettingsTabId } from "../model/tabs";

const TABS = [
  { id: "display-name", label: "Display Name", icon: UserRound },
  { id: "photo", label: "Photo", icon: Camera },
  { id: "location", label: "Location", icon: MapPin },
  { id: "bio", label: "Bio", icon: PenSquare },
] as const satisfies ReadonlyArray<{
  id: ProfileSettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}>;

type Props = {
  activeTab: ProfileSettingsTabId;
  onTabChange: (tab: ProfileSettingsTabId) => void;
  summaries: Record<ProfileSettingsTabId, string>;
};

export function ProfileSettingsTabs({ activeTab, onTabChange, summaries }: Props) {
  return (
    <section className="app-settings-section overflow-hidden rounded-[30px]">
      <div className="border-b border-(--app-settings-divider) px-5 py-5 sm:px-6">
        <h3 className="text-[1.18rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
          General
        </h3>
        <p className="mt-1.5 text-[14px] leading-[1.65] tracking-[-0.02em] text-(--app-text-muted)">
          Manage your basic public profile information.
        </p>
      </div>

      <div className="divide-y divide-(--app-settings-divider)">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "app-settings-option group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 sm:px-6 sm:py-5",
                isActive && "app-settings-option-active",
              )}
            >
              <span className="flex min-w-0 items-center gap-3.5">
                <span
                  className={cn(
                    "app-settings-tab-icon inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200",
                    isActive && "app-settings-tab-icon-active",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.95} />
                </span>

                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
                    {tab.label}
                  </span>
                  <span className="mt-1 block truncate text-[13px] tracking-[-0.02em] text-(--app-text-muted)">
                    {summaries[tab.id]}
                  </span>
                </span>
              </span>

              <ChevronRight
                className={cn(
                  "h-4.5 w-4.5 shrink-0 text-(--app-text-faint) transition-transform duration-200 group-hover:translate-x-0.5",
                  isActive && "app-settings-accent",
                )}
                strokeWidth={1.95}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
