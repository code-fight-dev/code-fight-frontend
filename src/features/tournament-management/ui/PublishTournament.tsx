"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeTournamentStatus, type TournamentDraft } from "@/entities/tournament";
import { managementErrorMessage } from "@/shared/api/management";
import { Button } from "@/shared/ui/Button";

export function PublishTournament({
  draft,
  tasks,
  disabled,
}: {
  draft: TournamentDraft;
  tasks: { slug: string; title: string }[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [taskSlug, setTaskSlug] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function publish() {
    setPublishing(true);
    setError("");
    try {
      await changeTournamentStatus(draft.id, "published", draft.configVersion, taskSlug);
      router.push("/tournaments/" + draft.id);
    } catch (error) {
      setError(managementErrorMessage(error));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="grid gap-3 border-t border-(--app-control-secondary-border) pt-4">
      <label className="grid gap-2">
        Tournament challenge
        <select
          className="rounded-xl border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) px-3 py-2"
          value={taskSlug}
          disabled={disabled || publishing}
          onChange={(event) => setTaskSlug(event.target.value)}
        >
          <option value="">Select a challenge</option>
          {tasks.map((task) => (
            <option key={task.slug} value={task.slug}>
              {task.title}
            </option>
          ))}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      <Button
        type="button"
        disabled={disabled || !taskSlug || publishing}
        onClick={() => void publish()}
      >
        {publishing ? "Publishing…" : "Publish and open registration"}
      </Button>
    </div>
  );
}
