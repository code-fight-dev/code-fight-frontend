"use client";

import { useEffect, useRef, useState } from "react";
import {
  createTournamentDraft,
  getTournamentDraft,
  updateTournamentDraft,
} from "@/entities/tournament";
import type { DraftInput, TournamentDraft } from "@/entities/tournament";
import { ManagementError, managementErrorMessage } from "@/shared/api/management";

export type TournamentDraftFormOptions = {
  draft: TournamentDraft | null;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onSaved: (draft: TournamentDraft, message: string) => void;
};

function formValues(draft: TournamentDraft | null): DraftInput {
  return {
    title: draft?.title ?? "",
    slug: draft?.slug ?? "",
    description: draft?.description ?? "",
  };
}

export function useTournamentDraftForm({
  draft,
  disabled,
  onBusyChange,
  onSaved,
}: TournamentDraftFormOptions) {
  const [values, setValues] = useState(() => formValues(draft));
  const [pending, setPending] = useState<"save" | "reload" | null>(null);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function updateField(field: keyof DraftInput, value: string) {
    if (activeRequest.current) return;
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function execute(operation: "save" | "reload") {
    if (activeRequest.current || disabled || (operation === "reload" && !draft)) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(operation);
    setError("");
    setConflict(false);
    onBusyChange(true);
    try {
      const result =
        operation === "reload" && draft
          ? await getTournamentDraft(draft.id, controller.signal)
          : draft
            ? await updateTournamentDraft(
                draft.id,
                values,
                draft.configVersion,
                controller.signal,
              )
            : await createTournamentDraft(values, controller.signal);
      if (controller.signal.aborted) return;
      // console.debug("[tournament.draft.resolved]", {
      //   operation, mode: draft ? "edit" : "create", tournamentId: result.id,
      //   previousVersion: draft?.configVersion ?? null, resolvedVersion: result.configVersion,
      //   changedFields: Object.keys(values).filter((key) => values[key as keyof DraftInput] !== draft?.[key as keyof DraftInput]),
      // });
      setValues(formValues(result));
      onSaved(result, operation === "reload" ? "Draft reloaded." : "Draft saved.");
    } catch (error) {
      if (controller.signal.aborted) return;
      setConflict(error instanceof ManagementError && error.code === "version_conflict");
      setError(managementErrorMessage(error));
      // console.warn("[tournament.draft.rejected]", {
      //   operation, tournamentId: draft?.id ?? null, expectedVersion: draft?.configVersion ?? null,
      //   status: error instanceof ManagementError ? error.status : null,
      //   code: error instanceof ManagementError ? error.code : undefined,
      //   requestId: error instanceof ManagementError ? error.requestId : undefined,
      //   conflict: error instanceof ManagementError && error.code === "version_conflict",
      //   preservesLocalEdits: true,
      // });
    } finally {
      if (!controller.signal.aborted) {
        activeRequest.current = null;
        setPending(null);
        onBusyChange(false);
      }
    }
  }

  return {
    values,
    pending,
    busy: pending !== null,
    error,
    conflict,
    updateField,
    save: () => execute("save"),
    reload: () => execute("reload"),
  };
}
