type Props = {
  totalChallenges: number;
  solvedCount: number;
  activeCount: number;
};

export function ChallengesPageStats({
  totalChallenges,
  solvedCount,
  activeCount,
}: Props) {
  return (
    <dl className="mt-7 grid gap-3 sm:grid-cols-3">
      {[
        ["Catalog", `${totalChallenges} problems`],
        ["Solved", `${solvedCount} completed`],
        ["Active", `${activeCount} in progress`],
      ].map(([label, value]) => (
        <div key={label} className="challenge-panel-muted rounded-lg px-4 py-3">
          <dt className="text-[12px] text-(--app-text-faint)">{label}</dt>
          <dd className="mt-1 text-[18px] font-semibold text-(--app-text-strong)">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
