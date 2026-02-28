import { Button } from "@/shared/ui/Button";
import { Container } from "@/shared/ui/Container";
import { Reveal } from "@/shared/ui/Reveal";
import type { LeaderboardCtaSnapshot } from "../model/types";

type Props = {
  snapshot: LeaderboardCtaSnapshot;
};

export function LeaderboardCta({ snapshot }: Props) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#09101d_0%,#08101c_100%)] pb-20 sm:pb-24 xl:pb-28">
      <Container className="relative">
        <Reveal
          className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(5,8,18,0.96)_0%,rgba(8,11,22,0.92)_100%)] px-5 py-12 text-center shadow-[0_24px_80px_rgba(3,7,18,0.42)] sm:px-8 sm:py-16 md:px-10 md:py-18 xl:px-14 xl:py-20 2xl:px-16 2xl:py-24"
          variant="scale"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(37,99,235,0.08),transparent_20%),radial-gradient(circle_at_88%_82%,rgba(76,29,149,0.06),transparent_18%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 left-[10%] h-40 w-40 rounded-full bg-[#2563eb]/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-4xl">
            <h2 className="mx-auto max-w-[12ch] text-[2rem] leading-[0.96] font-semibold tracking-[-0.075em] text-white sm:text-[2.8rem] md:text-[3.35rem] xl:text-[4rem] 2xl:text-[4.5rem]">
              {snapshot.title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-[1.7] tracking-[-0.03em] text-white/44 sm:mt-6 sm:text-[1.04rem] xl:max-w-176 xl:text-[1.12rem]">
              {snapshot.description}
            </p>

            <div className="mt-8 sm:mt-10">
              <Button
                href={snapshot.actionHref}
                className="min-h-13.5 w-full rounded-2xl border-[#5a86ff]/60 bg-[#3466f6] px-7 py-4 text-[14px] shadow-[0_18px_44px_rgba(37,99,235,0.28)] hover:border-[#8fb2ff] hover:bg-[#3f71ff] hover:shadow-[0_24px_54px_rgba(37,99,235,0.38)] sm:min-h-14 sm:w-auto sm:px-8 sm:text-[15px] 2xl:min-h-15 2xl:px-9 2xl:text-[16px]"
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
