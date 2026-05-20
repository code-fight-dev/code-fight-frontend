import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import { RankingDesktopTable } from "./RankingDesktopTable";
import { RankingMobileCards } from "./RankingMobileCards";

export function RankingPageView() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-12 lg:py-16">
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,0.08),transparent_18%),linear-gradient(180deg,transparent,rgba(8,12,24,0.18)_100%)]"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.56)_0.7px,transparent_0.8px)] mask-[linear-gradient(180deg,transparent,black_12%,black_88%,transparent)] bg-size-[30px_30px] opacity-[0.08]"
      />

      <Container className="relative">
        <Reveal className="mx-auto max-w-6xl">
          <section className="app-shell-card profile-card-solid relative overflow-hidden rounded-[34px] p-6 sm:p-8 lg:p-9">
            <div
              aria-hidden
              className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.14),transparent_26%),radial-gradient(circle_at_84%_16%,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,transparent,rgba(8,12,24,0.2)_100%)]"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="font-accent text-[11px] tracking-[0.22em] text-blue-300 uppercase">
                  Ranking System
                </div>
                <h1 className="mt-4 text-[2.3rem] font-semibold tracking-[-0.075em] text-(--app-text-strong) sm:text-[2.9rem] lg:text-[3.2rem]">
                  Full rank table
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-[1.72] tracking-[-0.03em] text-(--app-text-muted) sm:text-[16px]">
                  All tiers, their rating bands, colors, and short explanations in one
                  place.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal className="mx-auto mt-6 max-w-6xl" delay={80}>
          <section className="app-shell-card profile-card-solid relative overflow-hidden rounded-[34px] p-5 sm:p-6 lg:p-7">
            <div
              aria-hidden
              className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_22%),linear-gradient(180deg,transparent,rgba(8,12,24,0.2)_100%)]"
            />

            <div className="relative">
              <RankingDesktopTable />
              <RankingMobileCards />
            </div>
          </section>
        </Reveal>
      </Container>
    </section>
  );
}
