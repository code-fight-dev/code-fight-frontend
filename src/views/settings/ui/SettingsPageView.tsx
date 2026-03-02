import { PreferencesSettingsPanel } from "@/features/preferences";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";

export function SettingsPageView() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-18 lg:py-22">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(37,99,235,0.12),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.08),transparent_18%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[14%] w-px bg-[linear-gradient(180deg,transparent,var(--app-grid-line),transparent)]"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-4xl">
          <div className="font-accent text-[12px] tracking-[0.22em] text-blue-400/78 uppercase">
            Preferences
          </div>
          <h1 className="mt-4 text-[2.25rem] font-semibold tracking-[-0.07em] text-(--app-text-strong) sm:text-[3rem] lg:text-[3.4rem]">
            Tune the interface for your setup
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-[1.78] tracking-[-0.03em] text-(--app-text-muted) sm:text-[1.08rem]">
            Adjust the shell appearance and motion profile locally. These changes stay on
            your device for now and can be revised at any moment.
          </p>
        </Reveal>

        <div className="mt-10 sm:mt-12 lg:mt-14">
          <PreferencesSettingsPanel />
        </div>
      </Container>
    </section>
  );
}
