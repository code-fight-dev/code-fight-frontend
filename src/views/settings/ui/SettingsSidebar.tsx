import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { SettingsSectionId } from "@/shared/config/routes";
import { SETTINGS_SECTIONS } from "@/views/settings/model/sections";

type Props = Readonly<{
  activeSectionId: SettingsSectionId;
}>;

export function SettingsSidebar({ activeSectionId }: Props) {
  return (
    <aside className="app-settings-rail border-b border-(--app-settings-divider) px-5 py-6 sm:px-6 lg:min-h-180 lg:border-r lg:border-b-0 lg:px-6 lg:py-7">
      <div className="flex items-center gap-4">
        <span className="app-settings-brand-icon inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl text-blue-300">
          <SlidersHorizontal className="h-6 w-6" strokeWidth={2.1} />
        </span>

        <div className="min-w-0">
          <h2 className="text-[2rem] font-semibold tracking-[-0.06em] text-(--app-text-strong)">
            Settings
          </h2>
        </div>
      </div>

      <nav aria-label="Settings sections" className="mt-8 grid gap-2">
        {SETTINGS_SECTIONS.map((section) => {
          const isActive = activeSectionId === section.id;
          const Icon = section.icon;

          return (
            <Link
              key={section.id}
              href={section.href}
              prefetch
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "app-settings-nav-item group flex items-center justify-between gap-3 rounded-[20px] px-4 py-3.5 focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-focus-ring-offset) focus-visible:outline-none",
                isActive && "app-settings-nav-item-active",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--app-settings-badge-border) bg-(--app-settings-badge-bg) text-blue-400 transition-colors duration-200",
                    isActive && "border-blue-400/22 bg-blue-500/12",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>

                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold tracking-[-0.03em]">
                    {section.label}
                  </span>
                  <span className="mt-1 block text-[12px] tracking-[0.16em] text-(--app-text-faint) uppercase">
                    {section.meta}
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
