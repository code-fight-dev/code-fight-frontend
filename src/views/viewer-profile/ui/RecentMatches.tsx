import { ProfileSection } from "./ProfileSection";

export function RecentMatches() {
  const columns = ["Result", "Opponent", "Difficulty", "Elo Δ", "Action"];

  return (
    <ProfileSection
      title="Recent Matches"
      description="The layout is ready for real match history once sandbox data is available."
      contentClassName="mt-5"
    >
      <div className="overflow-hidden rounded-3xl border border-white/8 bg-white/3">
        <div className="overflow-x-auto">
          <div className="min-w-2xl">
            <div className="grid grid-cols-[1.1fr_1.35fr_1fr_0.8fr_1fr] gap-3 border-b border-white/8 px-4 py-3 text-[11px] tracking-[0.18em] text-(--app-text-faint) uppercase">
              {columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>

            <div className="px-4 py-8">
              <div className="rounded-[20px] border border-dashed border-white/12 bg-white/3 px-4 py-6 text-center">
                <div className="text-[15px] font-medium tracking-[-0.03em] text-(--app-text-strong)">
                  No recent matches yet
                </div>
                <p className="mt-2 text-[14px] leading-[1.68] tracking-[-0.02em] text-(--app-text-muted)">
                  Match rows with opponent, difficulty, Elo changes, and replay actions
                  will plug into this table once the backend stream is connected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
