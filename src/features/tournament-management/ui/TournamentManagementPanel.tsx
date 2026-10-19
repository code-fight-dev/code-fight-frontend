"use client";

import Link from "next/link";
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
      {management.accessError ? (
        <div className="app-surface rounded-3xl p-6">
          <p>
            {management.accessError.status === 401
              ? "Your session has expired. Sign in to manage tournaments."
              : "You no longer have access to tournament management."}
          </p>
          <Link
            href={management.accessError.status === 401 ? "/signin" : "/"}
            className="mt-4 inline-block text-blue-400 underline"
          >
            {management.accessError.status === 401 ? "Sign in" : "Go home"}
          </Link>
        </div>
      ) : (
        <TournamentDraftForm
          key={management.selected?.id ?? "new"}
          draft={management.selected}
          disabled={management.loading}
          initialValues={management.initialValues}
          unconfirmedSave={management.unconfirmedSave}
          onBusyChange={management.onBusyChange}
          onSaved={management.onSaved}
          onDirtyChange={management.onDirtyChange}
          onAccessError={management.onError}
          onReconciliationChange={management.onReconciliationChange}
        />
      )}
    </div>
  );
}
