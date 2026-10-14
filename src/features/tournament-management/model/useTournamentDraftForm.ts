"use client";

import { useEffect, useRef, useState } from "react";
import {
  createTournamentDraft,
  findTournamentDraftBySlug,
  getTournamentDraft,
  updateTournamentDraft,
} from "@/entities/tournament";
import type { DraftInput, TournamentDraft } from "@/entities/tournament";
import {
  isManagementAccessError,
  isUncertainMutationError,
  ManagementError,
  managementErrorMessage,
} from "@/shared/api/management";

export type TournamentDraftFormOptions = {
  draft: TournamentDraft | null;
  disabled: boolean;
  initialValues?: DraftInput;
  unconfirmedSave?: DraftInput | null;
  onBusyChange: (busy: boolean) => void;
  onSaved: (
    draft: TournamentDraft,
    message: string,
    preservedValues?: DraftInput,
  ) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onAccessError?: (error: ManagementError) => void;
  onReconciliationChange?: (input: DraftInput | null) => void;
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
  initialValues,
  unconfirmedSave,
  onBusyChange,
  onSaved,
  onDirtyChange,
  onAccessError,
  onReconciliationChange,
}: TournamentDraftFormOptions) {
  const [serverDraft, setServerDraft] = useState(draft);
  const [values, setValues] = useState(
    () => initialValues ?? unconfirmedSave ?? formValues(draft),
  );
  const [pending, setPending] = useState<"save" | "reload" | "check" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [conflict, setConflict] = useState(false);
  const [uncertainSave, setUncertainSave] = useState<DraftInput | null>(
    unconfirmedSave ?? null,
  );
  const activeRequest = useRef<AbortController | null>(null);
  const baseline = formValues(serverDraft);
  const dirty =
    values.title !== baseline.title ||
    values.slug !== baseline.slug ||
    values.description !== baseline.description;

  useEffect(() => () => activeRequest.current?.abort(), []);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function updateField(field: keyof DraftInput, value: string) {
    if (activeRequest.current || disabled) return;
    setValues((current) => ({ ...current, [field]: value }));
  }

  function clearUncertainty() {
    setUncertainSave(null);
    onReconciliationChange?.(null);
  }

  async function execute(operation: "save" | "reload" | "check") {
    if (
      activeRequest.current ||
      disabled ||
      (operation === "reload" && !serverDraft) ||
      (operation === "save" && uncertainSave) ||
      (operation === "check" && !uncertainSave)
    )
      return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(operation);
    setError("");
    setNotice("");
    setConflict(false);
    onBusyChange(true);
    try {
      const result =
        operation === "check"
          ? serverDraft
            ? await getTournamentDraft(serverDraft.id, controller.signal)
            : await findTournamentDraftBySlug(uncertainSave!.slug, controller.signal)
          : operation === "reload" && serverDraft
            ? await getTournamentDraft(serverDraft.id, controller.signal)
            : serverDraft
              ? await updateTournamentDraft(
                  serverDraft.id,
                  values,
                  serverDraft.configVersion,
                  controller.signal,
                )
              : await createTournamentDraft(values, controller.signal);
      if (controller.signal.aborted) return;
      clearUncertainty();
      if (!result) {
        setNotice(
          "No draft with the submitted slug was found. You can try creating it again.",
        );
        return;
      }
      setServerDraft(result);
      if (operation === "check") {
        onSaved(result, "Server draft checked. Review your edits before saving.", values);
      } else {
        setValues(formValues(result));
        onSaved(result, operation === "reload" ? "Draft reloaded." : "Draft saved.");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      if (isManagementAccessError(error)) {
        onAccessError?.(error);
      } else if (operation === "save" && isUncertainMutationError(error)) {
        setUncertainSave(values);
        onReconciliationChange?.(values);
      }
      setConflict(error instanceof ManagementError && error.code === "version_conflict");
      setError(managementErrorMessage(error));
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
    notice,
    conflict,
    requiresReconciliation: uncertainSave !== null,
    updateField,
    save: () => execute("save"),
    reload: () => execute("reload"),
    checkSaveStatus: () => execute("check"),
  };
}
