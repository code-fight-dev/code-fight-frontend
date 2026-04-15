import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { ChallengeListItem } from "@/entities/challenge";
import { formatAttempts } from "../model/presentation";
import { DifficultyBadge } from "./DifficultyBadge";
import { ChallengeProgressStatus } from "./ChallengeProgressStatus";
import { ChallengeTopics } from "./ChallengeTopics";

type Props = {
  challenges: ChallengeListItem[];
};

const CHALLENGE_TABLE_GRID = "grid-cols-[3.5rem_minmax(0,1fr)_8rem_7rem]";

function ChallengeMeta({ challenge }: { challenge: ChallengeListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-(--app-text-faint)">
      <span className="inline-flex items-center gap-1.5">
        <Clock3 aria-hidden className="h-3.5 w-3.5" />
        {challenge.estimatedMinutes} min
      </span>
      <span>{formatAttempts(challenge.attempts)} attempts</span>
    </div>
  );
}

function ChallengeDesktopRow({ challenge }: { challenge: ChallengeListItem }) {
  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className={`challenge-table-row group grid ${CHALLENGE_TABLE_GRID} items-center gap-4 border-t px-4 py-3.5 transition-colors first:border-t-0 focus:outline-none focus-visible:bg-(--app-option-active-bg)`}
    >
      <div className="flex min-h-9 items-center justify-center">
        <ChallengeProgressStatus progress={challenge.progress} />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-(--app-text-strong) transition-colors group-hover:text-blue-200">
            {challenge.title}
          </h3>
          <ArrowUpRight
            aria-hidden
            className="h-4 w-4 shrink-0 text-(--app-text-faint) transition-colors group-hover:text-blue-300"
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <ChallengeMeta challenge={challenge} />
          <ChallengeTopics challenge={challenge} limit={3} />
        </div>
      </div>

      <span className="text-[15px] font-semibold tracking-[-0.01em] text-(--app-text-strong)">
        {challenge.acceptanceRate}%
      </span>
      <DifficultyBadge difficulty={challenge.difficulty} className="text-[15px]" />
    </Link>
  );
}

function ChallengeMobileCard({ challenge }: { challenge: ChallengeListItem }) {
  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className="challenge-panel-soft challenge-focus-ring group block rounded-lg p-4 transition-colors hover:border-(--app-control-secondary-hover-border)"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <ChallengeProgressStatus progress={challenge.progress} />
          <h3 className="mt-2 text-[16px] font-semibold text-(--app-text-strong) transition-colors group-hover:text-blue-200">
            {challenge.title}
          </h3>
        </div>
        <ArrowUpRight
          aria-hidden
          className="mt-1 h-4 w-4 shrink-0 text-(--app-text-faint) transition-colors group-hover:text-blue-300"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
        <div>
          <div className="text-[12px] text-(--app-text-faint)">Accepted</div>
          <div className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-(--app-text-strong)">
            {challenge.acceptanceRate}%
          </div>
        </div>
        <div>
          <div className="text-[12px] text-(--app-text-faint)">Difficulty</div>
          <div className="mt-1">
            <DifficultyBadge difficulty={challenge.difficulty} className="text-[15px]" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ChallengeTopics challenge={challenge} limit={3} />
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-(--app-surface-soft-border) pt-3">
        <ChallengeMeta challenge={challenge} />
      </div>
    </Link>
  );
}

export function ChallengeList({ challenges }: Props) {
  if (challenges.length === 0) {
    return (
      <section className="challenge-panel-muted rounded-lg border-dashed p-8 text-center">
        <h2 className="text-[18px] font-semibold text-(--app-text-strong)">
          No challenges found
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-(--app-text-muted)">
          Try clearing a filter or broadening the search terms.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Challenge results">
      <div className="challenge-panel hidden overflow-hidden rounded-lg lg:block">
        <div
          className={`challenge-panel-header grid ${CHALLENGE_TABLE_GRID} gap-4 border-b px-4 py-3 text-[12px] font-semibold text-(--app-text-faint)`}
        >
          <span>Status</span>
          <span>Challenge</span>
          <span>Accepted</span>
          <span>Level</span>
        </div>

        {challenges.map((challenge) => (
          <ChallengeDesktopRow key={challenge.id} challenge={challenge} />
        ))}
      </div>

      <div className="grid gap-3 lg:hidden">
        {challenges.map((challenge) => (
          <ChallengeMobileCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </section>
  );
}
