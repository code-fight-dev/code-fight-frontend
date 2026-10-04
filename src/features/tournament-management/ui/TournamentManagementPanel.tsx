"use client";

import { useTournamentManagement } from "../model/useTournamentManagement";
import { TournamentDraftForm } from "./TournamentDraftForm";
import { TournamentDraftList } from "./TournamentDraftList";

export function TournamentManagementPanel() {
  const management = useTournamentManagement();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <TournamentDraftList
        drafts={management.drafts}
        selectedId={management.selected?.id}
        loading={management.loading}
        disabled={management.controlsDisabled}
        hasMore={management.hasMore}
        error={management.error}
        notice={management.notice}
        onSelect={management.selectDraft}
        onLoadMore={management.loadMore}
        onRefresh={management.refreshList}
      />
      <TournamentDraftForm
        key={`${management.selected?.id ?? "new"}:${management.selected?.configVersion ?? 0}`}
        draft={management.selected}
        disabled={management.loading}
        onBusyChange={management.onBusyChange}
        onSaved={management.onSaved}
      />
    </div>
  );
}
