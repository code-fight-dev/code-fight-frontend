"use client";

import { Check, Monitor, MoonStar, SunMedium, Zap, ZapOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { usePreferences } from "./PreferencesProvider";

const themeOptions = [
  {
    value: "default",
    label: "Default",
    description: "Keep the current arena look.",
    icon: MoonStar,
  },
  {
    value: "light",
    label: "Light",
    description: "Switch to a brighter interface shell.",
    icon: SunMedium,
  },
] as const;

const motionOptions = [
  {
    value: "enabled",
    label: "Enabled",
    description: "Play transitions and typing effects.",
    icon: Zap,
  },
  {
    value: "disabled",
    label: "Disabled",
    description: "Reduce motion for smoother performance.",
    icon: ZapOff,
  },
] as const;

export function PreferencesSettingsPanel() {
  const { preferences, setTheme, setMotion } = usePreferences();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="app-panel relative overflow-hidden rounded-[30px] px-6 py-6 sm:px-7 sm:py-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(56,189,248,0.1),transparent_18%)]"
        />

        <div className="relative">
          <div className="font-accent text-[12px] tracking-[0.2em] text-blue-400/72 uppercase">
            Appearance
          </div>
          <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[2rem]">
            Theme
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-[1.72] tracking-[-0.03em] text-(--app-text-muted) sm:text-[16px]">
            Switch between the current arena shell and a brighter light variation.
          </p>

          <div className="mt-6 rounded-[26px] border border-(--app-option-border) p-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = preferences.theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "relative rounded-[22px] border px-4 py-4 text-left transition-all duration-200 sm:px-5 sm:py-5",
                      isActive ? "app-segment-active" : "app-segment",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="app-option-icon">
                        <Icon className="h-5 w-5" strokeWidth={1.9} />
                      </span>

                      <span className="block flex-1">
                        <span className="block text-[16px] font-semibold tracking-[-0.04em] text-(--app-text-strong) sm:text-[17px]">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[14px] leading-[1.65] tracking-[-0.03em] text-(--app-text-muted) sm:text-[15px]">
                          {option.description}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200",
                          isActive
                            ? "border-blue-400/30 bg-blue-500/14 text-blue-400"
                            : "border-(--app-option-border) text-transparent",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="app-panel rounded-[30px] px-6 py-6 sm:px-7 sm:py-7">
          <div className="font-accent text-[12px] tracking-[0.2em] text-blue-400/72 uppercase">
            Performance
          </div>
          <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[2rem]">
            Motion
          </h2>
          <p className="mt-2 text-[15px] leading-[1.72] tracking-[-0.03em] text-(--app-text-muted) sm:text-[16px]">
            Disable interface motion if you want the cleanest possible rendering.
          </p>

          <div className="mt-6 rounded-[26px] border border-(--app-option-border) p-2">
            <div className="grid gap-2">
              {motionOptions.map((option) => {
                const Icon = option.icon;
                const isActive = preferences.motion === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setMotion(option.value)}
                    className={cn(
                      "relative rounded-[22px] border px-4 py-4 text-left transition-all duration-200 sm:px-5 sm:py-5",
                      isActive ? "app-segment-active" : "app-segment",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span className="app-option-icon">
                        <Icon className="h-5 w-5" strokeWidth={1.9} />
                      </span>

                      <span className="block flex-1">
                        <span className="block text-[16px] font-semibold tracking-[-0.04em] text-(--app-text-strong) sm:text-[17px]">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[14px] leading-[1.65] tracking-[-0.03em] text-(--app-text-muted) sm:text-[15px]">
                          {option.description}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200",
                          isActive
                            ? "border-blue-400/30 bg-blue-500/14 text-blue-400"
                            : "border-(--app-option-border) text-transparent",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="app-panel-subtle rounded-[30px] px-6 py-6 sm:px-7 sm:py-7">
          <div className="flex items-center gap-3">
            <span className="app-option-icon">
              <Monitor className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
                Current setup
              </div>
              <div className="mt-1 text-[14px] tracking-[-0.03em] text-(--app-text-muted)">
                Theme: {preferences.theme === "light" ? "Light" : "Default"}
              </div>
              <div className="mt-1 text-[14px] tracking-[-0.03em] text-(--app-text-muted)">
                Motion: {preferences.motion === "disabled" ? "Disabled" : "Enabled"}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-(--app-option-border) bg-(--app-option-bg) p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-(--app-surface-strong-border) bg-(--app-surface-strong) px-3 py-3">
                <div className="font-accent text-[10px] tracking-[0.18em] text-blue-400/72 uppercase">
                  Theme
                </div>
                <div className="mt-2 text-[14px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
                  {preferences.theme === "light" ? "Light shell" : "Default shell"}
                </div>
              </div>
              <div className="rounded-[18px] border border-(--app-surface-strong-border) bg-(--app-surface-strong) px-3 py-3">
                <div className="font-accent text-[10px] tracking-[0.18em] text-blue-400/72 uppercase">
                  Motion
                </div>
                <div className="mt-2 text-[14px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
                  {preferences.motion === "disabled" ? "Reduced" : "Full"}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
