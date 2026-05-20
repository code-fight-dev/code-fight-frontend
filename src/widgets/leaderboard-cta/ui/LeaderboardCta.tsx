import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import type { LeaderboardCtaSnapshot } from "../model/types";

type Props = {
  snapshot: LeaderboardCtaSnapshot;
};

export function LeaderboardCta({ snapshot }: Props) {
  return (
    <section className="relative overflow-hidden bg-(--app-surface-contrast) pb-20 sm:pb-24 xl:pb-28">
      <Container className="relative">
        <Reveal
          className="app-shell-card relative overflow-hidden rounded-[28px] px-5 py-12 text-center sm:px-8 sm:py-16 md:px-10 md:py-18 xl:px-14 xl:py-20 2xl:px-16 2xl:py-24"
          variant="scale"
        >
          <div
            aria-hidden
            className="app-motion-decorative pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(37,99,235,0.08),transparent_20%),radial-gradient(circle_at_88%_82%,rgba(76,29,149,0.06),transparent_18%)]"
          />
          <div
            aria-hidden
            className="app-motion-decorative pointer-events-none absolute -bottom-12 left-[10%] h-40 w-40 rounded-full bg-[#2563eb]/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl">
            <h2 className="mx-auto max-w-[12ch] text-[2rem] leading-[0.96] font-semibold tracking-[-0.075em] text-(--app-text-strong) sm:text-[2.8rem] md:text-[3.35rem] xl:text-[4rem] 2xl:text-[4.5rem]">
              {snapshot.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-[1.7] tracking-[-0.03em] text-(--app-text-soft) sm:mt-6 sm:text-[1.04rem] xl:max-w-176 xl:text-[1.12rem]">
              {snapshot.description}
            </p>

            <div className="mt-8 sm:mt-10">
              <Button
                href={snapshot.actionHref}
                className="min-h-13.5 w-full rounded-2xl px-7 py-4 text-[14px] sm:min-h-14 sm:w-auto sm:px-8 sm:text-[15px] 2xl:min-h-15 2xl:px-9 2xl:text-[16px]"
              >
                {snapshot.actionLabel}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
