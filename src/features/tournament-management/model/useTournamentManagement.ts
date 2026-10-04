"use client";

import { useEffect, useRef, useState } from "react";
import { listTournamentDrafts } from "@/entities/tournament";
import type { DraftPage, TournamentDraft } from "@/entities/tournament";
import { managementErrorMessage } from "@/shared/api/management";

export function useTournamentManagement() {
  const [page, setPage] = useState<DraftPage>({ items: [] });
  const [selected, setSelected] = useState<TournamentDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editingBusy, setEditingBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const activeRequest = useRef<AbortController | null>(null);
  const editing = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;
    listTournamentDrafts(undefined, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        setPage(next);
        setError("");
        // console.debug("[tournament.drafts.loaded]", {
        //   mode: "replace", count: next.items.length, hasMore: Boolean(next.nextCursor),
        //   versions: next.items.map(({ id, configVersion }) => ({ id, configVersion })),
        // });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(managementErrorMessage(error));
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        activeRequest.current = null;
        setLoading(false);
      });
    return () => activeRequest.current?.abort();
  }, [refreshVersion]);

  async function loadMore() {
    if (!page.nextCursor || activeRequest.current || loading || editing.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    try {
      const next = await listTournamentDrafts(page.nextCursor, controller.signal);
      if (controller.signal.aborted) return;
      setPage((current) => {
        const ids = new Set(current.items.map((item) => item.id));
        return {
          items: [...current.items, ...next.items.filter((item) => !ids.has(item.id))],
          nextCursor: next.nextCursor,
        };
      });
      setError("");
      // console.debug("[tournament.drafts.loaded]", {
      //   mode: "append", receivedCount: next.items.length,
      //   existingCount: page.items.length, hasMore: Boolean(next.nextCursor),
      // });
    } catch (error) {
      if (!controller.signal.aborted) setError(managementErrorMessage(error));
    } finally {
      if (!controller.signal.aborted) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }

  function selectDraft(draft: TournamentDraft | null) {
    if (activeRequest.current || loading || editing.current) return;
    setSelected(draft);
    setNotice("");
  }

  function refreshList() {
    if (activeRequest.current || loading || editing.current) return;
    setLoading(true);
    setRefreshVersion((version) => version + 1);
  }

  function onBusyChange(busy: boolean) {
    editing.current = busy;
    setEditingBusy(busy);
    if (busy) setNotice("");
  }

  function onSaved(draft: TournamentDraft, message: string) {
    setSelected(draft);
    setNotice(message);
    setPage((current) => ({
      ...current,
      items: current.items.some((item) => item.id === draft.id)
        ? current.items.map((item) => (item.id === draft.id ? draft : item))
        : [draft, ...current.items],
    }));
  }

  return {
    drafts: page.items,
    hasMore: Boolean(page.nextCursor),
    selected,
    loading,
    error,
    notice,
    controlsDisabled: loading || editingBusy,
    loadMore,
    selectDraft,
    refreshList,
    onBusyChange,
    onSaved,
  };
}
