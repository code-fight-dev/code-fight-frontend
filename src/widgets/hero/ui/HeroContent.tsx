import Link from "next/link";
import { Reveal } from "@/shared/ui/Reveal";
import type { HeroSnapshot } from "../model/getHeroSnapshot";

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
      <div className="font-accent inline-flex items-center gap-2 rounded-full border border-blue-500/16 bg-blue-500/8 px-3 py-1.5 text-[11px] tracking-[0.22em] text-blue-300/88 uppercase shadow-[0_10px_35px_rgba(37,99,235,0.12)] sm:text-[12px] sm:tracking-[0.24em]">
        <span className="h-2 w-2 rounded-full bg-[#3b82f6] shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
        {snapshot.liveLabel}
      </div>

      <h1 className="mt-6 max-w-[12ch] text-[3rem] leading-[0.98] font-semibold tracking-[-0.09em] text-white sm:mt-8 sm:text-[4rem] md:text-[4.85rem] lg:text-[5.15rem] xl:text-[5.65rem] 2xl:text-[6.85rem]">
        <span className="block text-white/96">Code Battles:</span>
        <span className="mt-2 block bg-[linear-gradient(180deg,#62a8ff_0%,#3b82f6_54%,#2456d3_100%)] bg-clip-text pb-[0.08em] text-transparent">
          Prove Your Logic
        </span>
      </h1>

      <p className="mt-6 max-w-lg text-[1rem] leading-[1.72] tracking-[-0.03em] text-white/52 sm:mt-8 sm:text-[1.15rem] md:text-[1.22rem] xl:text-[1.32rem] 2xl:max-w-xl 2xl:text-[1.4rem]">
        High-stakes, professional PvP coding platform. Climb the Elo ladder in real-time
        matches against the world&apos;s most elite developers.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
        <Link
          href="/arena"
          className="font-accent inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-[#5a86ff]/60 bg-[#3466f6] px-6 py-4 text-[14px] font-semibold tracking-[-0.03em] text-white shadow-[0_18px_44px_rgba(37,99,235,0.28)] transition-all duration-200 hover:border-[#8fb2ff] hover:bg-[#3f71ff] hover:shadow-[0_24px_54px_rgba(37,99,235,0.38)] sm:min-h-15 sm:w-auto sm:px-7 sm:text-[15px] 2xl:min-h-16 2xl:px-8 2xl:text-[16px]"
        >
          Start Rating Game
          <span className="ml-2 text-base">▷</span>
        </Link>

        <Link
          href="/practice"
          className="font-accent inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/8 bg-white/3 px-6 py-4 text-[14px] font-semibold tracking-[-0.03em] text-white/86 shadow-[0_10px_30px_rgba(4,10,24,0.35)] transition-all duration-200 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-50 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)] sm:min-h-15 sm:w-auto sm:px-7 sm:text-[15px] 2xl:min-h-16 2xl:px-8 2xl:text-[16px]"
        >
          Practice Arena
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center">
        <div className="flex items-center -space-x-3">
          {snapshot.featuredDevelopers.map((developer) => (
            <div
              key={developer.id}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a1020] bg-linear-to-br ${developer.tintClassName} font-accent text-[11px] font-semibold tracking-[-0.04em] text-[#101626] shadow-[0_12px_26px_rgba(4,10,24,0.3)] sm:h-12 sm:w-12 sm:text-[12px] 2xl:h-13 2xl:w-13`}
              aria-hidden
            >
              {developer.initials}
            </div>
          ))}
          <div className="font-accent flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0a1020] bg-white/10 text-[11px] font-semibold tracking-[-0.04em] text-white/78 shadow-[0_12px_26px_rgba(4,10,24,0.24)] sm:h-12 sm:w-12 sm:text-[12px] 2xl:h-13 2xl:w-13">
            {queueBadge}
          </div>
        </div>

        <p className="text-[14px] tracking-[-0.025em] text-white/46 sm:text-[15px] md:text-base">
          Developers currently in queue
        </p>
      </div>
    </Reveal>
  );
}
