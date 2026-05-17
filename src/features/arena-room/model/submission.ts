import type { TaskSubmission } from "@/entities/challenge";
import { getSubmission } from "@/entities/challenge/client";
import { isFinalSubmissionStatus } from "./formatters";

export const SUBMISSION_POLL_INTERVAL_MS = 1500;
export const SUBMISSION_POLL_TIMEOUT_MS = 90_000;

type PollSubmissionUntilFinalInput = {
  initialSubmission: TaskSubmission;
  isMounted: () => boolean;
  onUpdate: (submission: TaskSubmission) => void;
  setAbortController: (controller: AbortController | null) => void;
};

export async function pollSubmissionUntilFinal({
  initialSubmission,
  isMounted,
  onUpdate,
  setAbortController,
}: PollSubmissionUntilFinalInput) {
  let latest = initialSubmission;
  if (isFinalSubmissionStatus(latest.status)) {
    return {
      submission: latest,
      timedOut: false,
    };
  }

  const deadline = Date.now() + SUBMISSION_POLL_TIMEOUT_MS;
  const controller = new AbortController();
  setAbortController(controller);

  while (Date.now() < deadline) {
    await new Promise<void>((resolve, reject) => {
      let timeoutId = 0;
      const abortListener = () => {
        window.clearTimeout(timeoutId);
        controller.signal.removeEventListener("abort", abortListener);
        reject(new DOMException("Aborted", "AbortError"));
      };

      timeoutId = window.setTimeout(() => {
        controller.signal.removeEventListener("abort", abortListener);
        resolve();
      }, SUBMISSION_POLL_INTERVAL_MS);

      controller.signal.addEventListener("abort", abortListener, { once: true });
    });

    latest = await getSubmission(latest.id, controller.signal);

    if (!isMounted()) {
      return {
        submission: latest,
        timedOut: false,
      };
    }

    onUpdate(latest);

    if (isFinalSubmissionStatus(latest.status)) {
      return {
        submission: latest,
        timedOut: false,
      };
    }
  }

  return {
    submission: latest,
    timedOut: true,
  };
}
