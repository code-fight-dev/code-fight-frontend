import Link from "next/link";
import { Swords, Target } from "lucide-react";

export function ChallengesPageHero() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
      <div className="max-w-3xl">
        <p className="challenge-kicker font-accent text-[13px] font-semibold text-blue-300">
          Solo practice
        </p>
        <h1 className="mt-3 text-[2.45rem] leading-none font-semibold text-(--app-text-strong) sm:text-[3.25rem]">
          Challenges
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-(--app-text-muted) sm:text-[16px]">
          Browse focused programming problems, study the prompt, and prepare a solution
          before stepping into live duels.
        </p>
      </div>

      <div className="challenge-panel-soft grid gap-2 rounded-lg p-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Link
          href="/arena"
          className="challenge-focus-ring group flex items-center gap-3 rounded-md border border-(--app-option-border) bg-(--app-option-bg) p-3 transition-colors hover:border-(--app-control-secondary-hover-border) hover:bg-(--app-control-secondary-hover-bg)"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rose-400/22 bg-rose-400/10 text-rose-400">
            <Swords aria-hidden className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-(--app-text-strong)">
              Arena
            </span>
            <span className="text-[12px] text-(--app-text-faint)">PvP matchmaking</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 rounded-md border border-(--app-option-active-border) bg-(--app-option-active-bg) p-3">
          <span className="challenge-accent-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-(--app-option-active-border) bg-(--app-option-active-bg) text-blue-300">
            <Target aria-hidden className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-(--app-text-strong)">
              Challenges
            </span>
            <span className="text-[12px] text-(--app-text-muted)">Solo practice</span>
          </span>
        </div>
      </div>
    </div>
  );
}
