"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { getSettingsSectionBySegment, SETTINGS_SECTIONS } from "../model/sections";

type Props = {
  children: ReactNode;
};

export function SettingsPageView({ children }: Props) {
  const selectedSegment = useSelectedLayoutSegment();
  const activeSection = getSettingsSectionBySegment(selectedSegment);

  return (
    <section className="relative overflow-hidden py-10 sm:py-12 lg:py-16">
      <div
        aria-hidden
        className="app-settings-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(37,99,235,0.12),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.08),transparent_18%),linear-gradient(180deg,transparent,rgba(8,12,24,0.14)_100%)]"
      />
      <div
        aria-hidden
        className="app-settings-grid pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.58)_0.7px,transparent_0.8px)] mask-[limask-[linear-gradient(180deg,transparent,black_18%,black_82%,transparent)]_36px] opacity-[0.12]"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-6xl">
          <h1 className="text-[2.2rem] font-semibold tracking-[-0.07em] text-(--app-text-strong) sm:text-[2.8rem] lg:text-[3.15rem]">
            Settings
          </h1>
        </Reveal>

        <Reveal className="mx-auto mt-6 max-w-6xl sm:mt-8" delay={80}>
          <div className="app-settings-shell relative overflow-hidden rounded-[34px]">
            <div
              aria-hidden
              className="app-settings-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.07),transparent_18%),radial-gradient(circle_at_74%_88%,rgba(37,99,235,0.06),transparent_18%)]"
            />
            <div
              aria-hidden
              className="app-settings-grid pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.64)_0.7px,transparent_0.8px)] mask-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,1)_18%,rgba(0,0,0,1)_82%,rgba(0,0,0,0.18))] bg-size-[28px_28px] opacity-[0.1]"
            />

            <div className="relative grid lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="app-settings-rail border-b border-(--app-settings-divider) px-5 py-6 sm:px-6 lg:min-h-180 lg:border-r lg:border-b-0 lg:px-6 lg:py-7">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_30%_28%,rgba(96,165,250,0.22),rgba(59,130,246,0.12)_42%,rgba(255,255,255,0.02)_100%)] text-blue-300 shadow-[0_14px_32px_rgba(2,6,23,0.18)] ring-1 ring-white/6">
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
                    const isActive = activeSection.id === section.id;
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

              <div className="px-5 py-6 sm:px-6 lg:px-10 lg:py-8">
                <div className="max-w-3xl">
                  <h2 className="text-[1.95rem] font-semibold tracking-[-0.07em] text-(--app-text-strong) sm:text-[2.35rem]">
                    {activeSection.label}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-[1.68] tracking-[-0.03em] text-(--app-text-muted) sm:text-[16px]">
                    {activeSection.description}
                  </p>
                </div>

                <div className="mt-8 lg:mt-10">{children}</div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
