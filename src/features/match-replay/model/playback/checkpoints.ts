import type { MatchReplay, MatchSubmission } from "@/entities/match";
import type { MatchReplayCheckpoint } from "../types";
import { parseTimestamp } from "./time";

function resolveSubmissionTimestamp(
  submission: MatchSubmission,
  startTimestamp: number,
): number {
  const submissionTimestamp =
    parseTimestamp(submission.createdAt) ??
    parseTimestamp(submission.updatedAt) ??
    startTimestamp;
  return Math.max(0, submissionTimestamp - startTimestamp);
}

export function resolveMatchStartTimestamp(replay: MatchReplay) {
  return (
    parseTimestamp(replay.match.startedAt) ?? parseTimestamp(replay.match.createdAt) ?? 0
  );
}

export function buildSubmissionCheckpoints(
  submissions: MatchSubmission[],
  startTimestamp: number,
): MatchReplayCheckpoint[] {
  const checkpoints: MatchReplayCheckpoint[] = [
    {
      id: "start",
      label: "Start",
      tMs: 0,
    },
  ];

  for (const submission of submissions) {
    checkpoints.push({
      id: submission.id,
      label: `Submit #${checkpoints.length}`,
      tMs: resolveSubmissionTimestamp(submission, startTimestamp),
      submissionId: submission.id,
      verdict: submission.verdict,
      status: submission.status,
      score: submission.score,
      createdAt: submission.createdAt,
    });
  }

  return checkpoints;
}
