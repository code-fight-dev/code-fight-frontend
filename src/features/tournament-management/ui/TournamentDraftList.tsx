import type { TournamentDraft } from "@/entities/tournament";
import { Button } from "@/shared/ui/Button";

type TournamentDraftListProps = {
  drafts: TournamentDraft[];
  selectedId?: string;
  loading: boolean;
  disabled: boolean;
  hasMore: boolean;
  error: string;
  notice: string;
  onSelect: (draft: TournamentDraft | null) => void;
  onLoadMore: () => Promise<void>;
  onRefresh: () => void;
};

export function TournamentDraftList({
  drafts,
  selectedId,
  loading,
  disabled,
  hasMore,
  error,
  notice,
  onSelect,
  onLoadMore,
  onRefresh,
}: TournamentDraftListProps) {
  return (
    <div className="app-surface rounded-3xl border border-(--app-control-secondary-border) p-6">
      <h2 className="text-xl font-semibold">Tournament drafts</h2>
      <p className="mt-2 text-sm text-(--app-text-soft)">
        Drafts are visible to their organizer and administrators.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm">
          {notice}
        </p>
      )}
      <ul className="mt-5 grid gap-3" aria-label="Tournament drafts">
        {drafts.map((draft) => (
          <li key={draft.id}>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selectedId === draft.id}
              onClick={() => onSelect(draft)}
              className="w-full rounded-2xl border border-(--app-control-secondary-border) p-4 text-left hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60"
            >
              <span className="block font-semibold">{draft.title}</span>
              <span className="mt-1 block text-sm text-(--app-text-soft)">
                {draft.slug} · Draft
              </span>
            </button>
          </li>
        ))}
      </ul>
      {loading && (
        <p role="status" className="mt-4 text-sm">
          Loading tournaments…
        </p>
      )}
      {!loading && !error && drafts.length === 0 && (
        <p className="mt-4 text-sm text-(--app-text-soft)">
          No drafts yet. Create your first tournament.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        {hasMore && (
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => void onLoadMore()}
          >
            Load more
          </Button>
        )}
        <Button variant="secondary" disabled={disabled} onClick={onRefresh}>
          Refresh list
        </Button>
        {selectedId && (
          <Button variant="secondary" disabled={disabled} onClick={() => onSelect(null)}>
            New draft
          </Button>
        )}
      </div>
    </div>
  );
}
