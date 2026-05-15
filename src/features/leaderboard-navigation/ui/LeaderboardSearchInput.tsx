import { Search } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function LeaderboardSearchInput({ query, onQueryChange }: Props) {
  return (
    <label className="group relative block w-full sm:w-72">
      <span className="sr-only">Search player</span>

      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--app-input-icon) transition-colors group-focus-within:text-blue-400"
      />

      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search player"
        className="app-input-surface h-10 w-full rounded-xl pr-3.5 pl-9 text-[14px] tracking-[-0.02em] outline-none"
      />
    </label>
  );
}
