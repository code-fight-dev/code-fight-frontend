import { Search, X } from "lucide-react";

type Props = Readonly<{
  onClear: () => void;
  onQueryChange: (value: string) => void;
  query: string;
  resultsCount: number;
}>;

export function DocsLocalSearchPanel({
  query,
  resultsCount,
  onClear,
  onQueryChange,
}: Props) {
  return (
    <section className="app-shell-card-soft rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-accent text-[11px] tracking-[0.2em] text-blue-300 uppercase">
            Local Search
          </p>
          <p className="mt-1 text-[13px] leading-6 text-(--app-text-muted)">
            Search across guides, API, Monaco settings, lifecycle, and FAQ.
          </p>
        </div>

        {query ? (
          <p className="text-[12px] tracking-[0.14em] text-(--app-text-faint) uppercase">
            {resultsCount} result{resultsCount === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <label className="group relative mt-3 block">
        <span className="sr-only">Search documentation</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-(--app-input-icon) transition-colors group-focus-within:text-blue-400"
        />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search docs..."
          className="challenge-control h-11 w-full rounded-lg pr-11 pl-10 text-[14px] transition-colors outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search query"
            className="absolute top-1/2 right-2.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>
    </section>
  );
}
