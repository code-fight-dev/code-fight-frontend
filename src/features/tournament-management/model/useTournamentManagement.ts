"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listTournamentDrafts } from "@/entities/tournament";
import type { DraftInput, DraftPage, TournamentDraft } from "@/entities/tournament";
import { useManagementAccess } from "@/entities/viewer";
import { managementErrorMessage } from "@/shared/api/management";

export function useTournamentManagement() {
  const { accessError, rejectAccess } = useManagementAccess();
  const [page, setPage] = useState<DraftPage>({ items: [] });
  const [selected, setSelected] = useState<TournamentDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [initialValues, setInitialValues] = useState<DraftInput | undefined>();
  const [unconfirmedSaves, setUnconfirmedSaves] = useState(
    () => new Map<string, DraftInput>(),
  );
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [editingBusy, setEditingBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const activeRequest = useRef<AbortController | null>(null);
  const editing = useRef(false);
  const dirty = useRef(false);

  const onError = useCallback(
    (error: unknown) => {
      setError(error);
      if (rejectAccess(error)) {
        setPage({ items: [] });
        setSelected(null);
        setInitialValues(undefined);
        setUnconfirmedSaves(new Map());
        setNotice("");
        setEditingBusy(false);
        dirty.current = false;
        editing.current = false;
      }
    },
    [rejectAccess],
  );

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;
    listTournamentDrafts(undefined, controller.signal)
      .then((next) => {
        if (controller.signal.aborted) return;
        setPage(next);
        setError(null);
        // console.debug("[tournament.drafts.loaded]", {
        //   mode: "replace", count: next.items.length, hasMore: Boolean(next.nextCursor),
        //   versions: next.items.map(({ id, configVersion }) => ({ id, configVersion })),
        // });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) onError(error);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        activeRequest.current = null;
        setLoading(false);
      });
    return () => activeRequest.current?.abort();
  }, [refreshVersion, onError]);

  async function loadMore() {
    if (
      !page.nextCursor ||
      activeRequest.current ||
      loading ||
      editing.current ||
      accessError
    )
      return;
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
      setError(null);
      // console.debug("[tournament.drafts.loaded]", {
      //   mode: "append", receivedCount: next.items.length,
      //   existingCount: page.items.length, hasMore: Boolean(next.nextCursor),
      // });
    } catch (error) {
      if (!controller.signal.aborted) onError(error);
    } finally {
      if (!controller.signal.aborted) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }

  function selectDraft(draft: TournamentDraft | null) {
    if (activeRequest.current || loading || editing.current || accessError) return;
    if (selected?.id === draft?.id) return;
    if (dirty.current && !window.confirm("Discard unsaved changes and switch drafts?"))
      return;
    dirty.current = false;
    setInitialValues(undefined);
    setSelected(draft);
    setNotice("");
  }

  function refreshList() {
    if (activeRequest.current || loading || editing.current || accessError) return;
    setLoading(true);
    setRefreshVersion((version) => version + 1);
  }

  function onBusyChange(busy: boolean) {
    editing.current = busy;
    setEditingBusy(busy);
    if (busy) setNotice("");
  }

  function onSaved(
    draft: TournamentDraft,
    message: string,
    preservedValues?: DraftInput,
  ) {
    setInitialValues(preservedValues);
    setSelected(draft);
    setNotice(message);
    setPage((current) => ({
      ...current,
      items: current.items.some((item) => item.id === draft.id)
        ? current.items.map((item) => (item.id === draft.id ? draft : item))
        : [draft, ...current.items],
    }));
  }

  function onDirtyChange(isDirty: boolean) {
    dirty.current = isDirty;
  }

  function onReconciliationChange(input: DraftInput | null) {
    const key = selected?.id ?? "new";
    setUnconfirmedSaves((current) => {
      const next = new Map(current);
      if (input) next.set(key, input);
      else next.delete(key);
      return next;
    });
  }

  return {
    drafts: page.items,
    hasMore: Boolean(page.nextCursor),
    selected,
    loading,
    error: error ? managementErrorMessage(error) : "",
    accessError,
    initialValues,
    unconfirmedSave: unconfirmedSaves.get(selected?.id ?? "new") ?? null,
    notice,
    controlsDisabled: loading || editingBusy || accessError !== null,
    loadMore,
    selectDraft,
    refreshList,
    onBusyChange,
    onSaved,
    onError,
    onDirtyChange,
    onReconciliationChange,
  };
}
