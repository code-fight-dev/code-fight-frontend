import { ProfileSection } from "@/views/viewer-profile/ui/ProfileSection";

const RECENT_MATCH_COLUMNS = ["Result", "Opponent", "Difficulty", "Elo Δ", "Action"];
const MOBILE_EMPTY_COPY =
  "Recent matches will appear here as stacked cards on phones once live data is connected.";
const DESKTOP_EMPTY_COPY =
  "Match rows with opponent, difficulty, Elo changes, and replay actions will plug into this table once the backend stream is connected.";

export function RecentMatches() {
  return (
    <ProfileSection
      title="Recent Matches"
      description="The layout is ready for real match history once sandbox data is available."
      contentClassName="mt-5"
    >
      <div className="rounded-3xl border border-white/8 bg-white/3 px-4 py-5 md:hidden">
        <RecentMatchesColumnPills />
        <div className="mt-4">
          <RecentMatchesEmptyState description={MOBILE_EMPTY_COPY} />
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-white/8 bg-white/3 md:block">
        <div className="overflow-x-auto">
          <div className="min-w-2xl">
            <div className="grid grid-cols-[1.1fr_1.35fr_1fr_0.8fr_1fr] gap-3 border-b border-white/8 px-4 py-3 text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
              {RECENT_MATCH_COLUMNS.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>

            <div className="px-4 py-8">
              <RecentMatchesEmptyState description={DESKTOP_EMPTY_COPY} />
            </div>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}

function RecentMatchesColumnPills() {
  return (
    <div className="flex flex-wrap gap-2 text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
      {RECENT_MATCH_COLUMNS.map((column) => (
        <span
          key={column}
          className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1.5"
        >
          {column}
        </span>
      ))}
    </div>
  );
}

type RecentMatchesEmptyStateProps = Readonly<{
  description: string;
}>;

function RecentMatchesEmptyState({ description }: RecentMatchesEmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/12 bg-white/3 px-4 py-6 text-center">
      <div className="text-[15px] font-medium tracking-[-0.03em] text-(--app-text-strong)">
        No recent matches yet
      </div>
      <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-muted)">
        {description}
      </p>
    </div>
  );
}
