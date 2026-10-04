"use client";

import { useId } from "react";
import { Button } from "@/shared/ui/Button";
import { useTournamentDraftForm } from "../model/useTournamentDraftForm";
import type { TournamentDraftFormOptions } from "../model/useTournamentDraftForm";

const fieldClass =
  "mt-2 w-full rounded-xl border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) px-4 py-3 text-(--app-text-strong) focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";

export function TournamentDraftForm(props: TournamentDraftFormOptions) {
  const slugId = useId();
  const form = useTournamentDraftForm(props);

  return (
    <form
      aria-busy={form.busy}
      onSubmit={(event) => {
        event.preventDefault();
        void form.save();
      }}
      className="app-surface grid content-start gap-5 rounded-3xl border border-(--app-control-secondary-border) p-6"
    >
      <h2 className="text-xl font-semibold">
        {props.draft ? "Edit draft" : "Create draft"}
      </h2>
      <label className="text-sm">
        Title
        <input
          className={fieldClass}
          required
          maxLength={200}
          value={form.values.title}
          disabled={form.busy}
          onChange={(event) => form.updateField("title", event.target.value)}
        />
      </label>
      <div>
        <label htmlFor={slugId} className="text-sm">
          Slug
        </label>
        <input
          id={slugId}
          className={fieldClass}
          required
          minLength={3}
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          value={form.values.slug}
          disabled={form.busy}
          onChange={(event) => form.updateField("slug", event.target.value)}
          aria-describedby={`${slugId}-help`}
        />
        <p id={`${slugId}-help`} className="mt-2 text-xs text-(--app-text-soft)">
          Lowercase letters, numbers and hyphens, for example autumn-cup.
        </p>
      </div>
      <label className="text-sm">
        Description
        <textarea
          className={fieldClass}
          rows={5}
          maxLength={20000}
          value={form.values.description}
          disabled={form.busy}
          onChange={(event) => form.updateField("description", event.target.value)}
        />
      </label>
      {form.error && (
        <div role="alert" className="text-sm text-red-400">
          <p>{form.error}</p>
          {form.conflict && props.draft && (
            <p className="mt-2">
              Your edits are still here. Reload draft to replace them with the current
              server version.
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={form.busy || props.disabled}>
          {form.pending === "save"
            ? "Saving…"
            : props.draft
              ? "Save changes"
              : "Create draft"}
        </Button>
        {props.draft && (
          <Button
            variant="secondary"
            disabled={form.busy || props.disabled}
            onClick={() => void form.reload()}
          >
            {form.pending === "reload" ? "Reloading…" : "Reload draft"}
          </Button>
        )}
      </div>
    </form>
  );
}
