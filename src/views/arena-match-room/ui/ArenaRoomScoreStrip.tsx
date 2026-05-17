type Props = {
  selfScore: number;
  opponentScore: number;
  selfAttempts: number;
  opponentAttempts: number;
  selfSolved: boolean;
  opponentSolved: boolean;
};

export function ArenaRoomScoreStrip({
  selfScore,
  opponentScore,
  selfAttempts,
  opponentAttempts,
  selfSolved,
  opponentSolved,
}: Props) {
  return (
    <article className="arena-match-score challenge-panel-muted mb-3 rounded-xl px-4 py-3">
      <div className="grid gap-3 text-[13px] md:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="text-(--app-text-faint)">Score</div>
          <div className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            {selfScore} : {opponentScore}
          </div>
        </div>
        <div>
          <div className="text-(--app-text-faint)">Attempts</div>
          <div className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            {selfAttempts} : {opponentAttempts}
          </div>
        </div>
        <div>
          <div className="text-(--app-text-faint)">You</div>
          <div className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            {selfSolved ? "Solved" : "Solving"}
          </div>
        </div>
        <div>
          <div className="text-(--app-text-faint)">Opponent</div>
          <div className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-(--app-text-strong)">
            {opponentSolved ? "Solved" : "Solving"}
          </div>
        </div>
      </div>
    </article>
  );
}
