import { Button } from "@/shared/ui/Button";
import { Reveal } from "@/shared/ui/Reveal";
import type { HeroSnapshot } from "../model/types";

type Props = {
  snapshot: HeroSnapshot;
};

const queueCountFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 0,
});

export function HeroContent({ snapshot }: Props) {
  const queueBadge = `+${queueCountFormatter.format(snapshot.queueCount).toUpperCase()}`;

  return (
    <Reveal className="max-w-176 2xl:max-w-200" delay={40}>
      <div className="font-accent inline-flex items-center gap-2.5 rounded-full border border-blue-500/18 bg-blue-500/8 px-3.5 py-2 text-[12px] tracking-[0.24em] text-blue-500 uppercase shadow-[0_10px_35px_rgba(37,99,235,0.12)] sm:text-[13px] sm:tracking-[0.26em]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
        {snapshot.liveLabel}
      </div>

      <h1 className="mt-6 max-w-[12ch] text-[3rem] leading-[0.98] font-semibold tracking-[-0.09em] text-(--app-text-strong) sm:mt-8 sm:text-[4rem] md:text-[4.85rem] lg:text-[5.15rem] xl:text-[5.65rem] 2xl:text-[6.85rem]">
        <span className="block text-(--app-text-strong)">Code Battles:</span>
        <span className="mt-2 block bg-[linear-gradient(180deg,#62a8ff_0%,#3b82f6_54%,#2456d3_100%)] bg-clip-text pb-[0.08em] text-transparent">
          Prove Your Logic
        </span>
      </h1>

      <p className="mt-6 max-w-lg text-[1rem] leading-[1.72] tracking-[-0.03em] text-(--app-text-soft) sm:mt-8 sm:text-[1.15rem] md:text-[1.22rem] xl:text-[1.32rem] 2xl:max-w-xl 2xl:text-[1.4rem]">
        High-stakes, professional PvP coding platform. Climb the Elo ladder in real-time
        matches against the world&apos;s most elite developers.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
        <Button
          href="/arena"
          className="min-h-14 w-full rounded-2xl px-6 py-4 text-[14px] sm:min-h-15 sm:w-auto sm:px-7 sm:text-[15px] 2xl:min-h-16 2xl:px-8 2xl:text-[16px]"
        >
          Start Rating Game
        </Button>

        <Button
          href="/challenges"
          variant="secondary"
          className="min-h-14 w-full rounded-2xl px-6 py-4 text-[14px] sm:min-h-15 sm:w-auto sm:px-7 sm:text-[15px] 2xl:min-h-16 2xl:px-8 2xl:text-[16px]"
        >
          Practice Arena
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center">
        <div className="flex items-center -space-x-3">
          {snapshot.featuredDevelopers.map((developer) => (
            <div
              key={developer.id}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-(--app-header-border-soft) bg-linear-to-br ${developer.tintClassName} font-accent text-[11px] font-semibold tracking-[-0.04em] text-[#101626] shadow-[0_12px_26px_rgba(4,10,24,0.18)] sm:h-12 sm:w-12 sm:text-[12px] 2xl:h-13 2xl:w-13`}
              aria-hidden
            >
              {developer.initials}
            </div>
          ))}
          <div className="font-accent flex h-10 w-10 items-center justify-center rounded-full border-2 border-(--app-header-border-soft) bg-(--app-control-secondary-bg) text-[11px] font-semibold tracking-[-0.04em] text-(--app-text-strong) shadow-[0_12px_26px_rgba(4,10,24,0.12)] sm:h-12 sm:w-12 sm:text-[12px] 2xl:h-13 2xl:w-13">
            {queueBadge}
          </div>
        </div>

        <p className="text-[14px] tracking-[-0.025em] text-(--app-text-soft) sm:text-[15px] md:text-base">
          Developers currently in queue
        </p>
      </div>
    </Reveal>
  );
}
