import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import {
  buildSubmissionCheckpoints,
  resolveMatchStartTimestamp,
  resolveSubmissionTimestamp,
} from "./checkpoints";
import { filterPlayerEvents, filterPlayerSnapshots } from "./timeline";
import type { ReplaySnapshotPoint, ReplayTrack } from "./types";

const FALLBACK_SUBMISSION_SNAPSHOT_SEQ_BASE = 1_000_000_000;

function resolveInitialLanguage(
  replay: MatchReplay,
  playerId: string,
  challenge: Challenge | null,
): string {
  const firstSnapshot = replay.timeline.snapshots.find(
    (snapshot) => snapshot.userId === playerId,
  );
  if (firstSnapshot) {
    return firstSnapshot.language;
  }

  const firstSubmission = replay.timeline.submissions.find(
    (submission) => submission.userId === playerId,
  );
  if (firstSubmission) {
    return firstSubmission.language;
  }

  if (challenge?.supportedLanguages.length) {
    return challenge.supportedLanguages[0];
  }

  return "typescript";
}

function resolveInitialSourceCode(language: string, challenge: Challenge | null): string {
  if (!challenge) {
    return "";
  }

  const starterCodeByLanguage = challenge.starterCodeByLanguage;
  const languageKey = language as keyof typeof starterCodeByLanguage;
  return starterCodeByLanguage[languageKey] ?? "";
}

function buildFallbackSnapshotsFromSubmissions(
  startTimestamp: number,
  initialLanguage: string,
  submissions: MatchReplay["timeline"]["submissions"],
): ReplaySnapshotPoint[] {
  return submissions.map((submission, index) => ({
    seq: FALLBACK_SUBMISSION_SNAPSHOT_SEQ_BASE + index,
    tMs: resolveSubmissionTimestamp(submission, startTimestamp),
    language: submission.language || initialLanguage,
    sourceCode: submission.sourceCode,
  }));
}

export function buildTrack(
  replay: MatchReplay,
  playerId: string,
  challenge: Challenge | null,
): ReplayTrack {
  const initialLanguage = resolveInitialLanguage(replay, playerId, challenge);
  const initialSourceCode = resolveInitialSourceCode(initialLanguage, challenge);
  const startTimestamp = resolveMatchStartTimestamp(replay);

  const playerSubmissions = replay.timeline.submissions
    .filter((submission) => submission.userId === playerId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const events = filterPlayerEvents(replay, playerId);
  const snapshots = filterPlayerSnapshots(replay, playerId);

  const fallbackSnapshots =
    snapshots.length === 0
      ? buildFallbackSnapshotsFromSubmissions(
          startTimestamp,
          initialLanguage,
          playerSubmissions,
        )
      : [];

  return {
    initialLanguage,
    initialSourceCode,
    durationMs: Math.max(0, replay.timeline.durationMs),
    events,
    snapshots: snapshots.length > 0 ? snapshots : fallbackSnapshots,
    checkpoints: buildSubmissionCheckpoints(playerSubmissions, startTimestamp),
  };
}
