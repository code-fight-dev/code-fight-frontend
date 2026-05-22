type Props = Readonly<{
  description: string;
}>;

export function RecentMatchesEmptyState({ description }: Props) {
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
