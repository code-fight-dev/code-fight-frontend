type Props = {
  filteredCount: number;
  totalCount: number;
};

export function ChallengesResultsSummary({ filteredCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[18px] font-semibold text-(--app-text-strong)">
          Problem set
        </h2>
        <p className="mt-1 text-[13px] text-(--app-text-faint)">
          {filteredCount} of {totalCount} challenges
        </p>
      </div>
      <p className="text-[13px] text-(--app-text-faint)">
        Sorted by your current practice plan.
      </p>
    </div>
  );
}
