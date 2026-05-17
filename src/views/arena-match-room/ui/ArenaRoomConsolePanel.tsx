import { Loader2, Terminal } from "lucide-react";
import type { TaskSubmission } from "@/entities/challenge";
import { toReadableStatus, toShortID } from "../model/presentation";

type Props = {
  isSubmitting: boolean;
  ownSubmission: TaskSubmission | null;
  outputMessage: string;
  submissionStatus: string;
};

export function ArenaRoomConsolePanel({
  isSubmitting,
  ownSubmission,
  outputMessage,
  submissionStatus,
}: Props) {
  return (
    <section className="challenge-code-block rounded-lg p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-cyan-300/24 bg-cyan-300/10 text-cyan-100">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Terminal className="h-4 w-4" />
          )}
        </span>
        <div>
          <h3 className="text-[14px] font-semibold text-(--app-text-strong)">
            Match console
          </h3>
          <p className="text-[12px] text-(--app-text-faint)">
            {ownSubmission
              ? `Latest submission: ${toShortID(ownSubmission.id)}`
              : "No submissions yet"}
          </p>
        </div>
      </div>
      <pre className="challenge-panel-muted font-accent mt-4 min-h-28 rounded-md p-3 text-[13px] leading-6 whitespace-pre-wrap text-(--app-text-muted)">
        {outputMessage}
      </pre>
      <div className="mt-2 text-[12px] text-(--app-text-faint)">
        Status: {toReadableStatus(submissionStatus)}
      </div>
    </section>
  );
}
