import { RECENT_MATCH_COLUMNS } from "./constants";

export function RecentMatchesColumnPills() {
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
