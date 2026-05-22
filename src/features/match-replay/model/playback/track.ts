import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import { buildSubmissionCheckpoints, resolveMatchStartTimestamp } from "./checkpoints";
import { filterPlayerEvents, filterPlayerSnapshots } from "./timeline";
import type { ReplayTrack } from "./types";

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

  return {
    initialLanguage,
    initialSourceCode,
    durationMs: Math.max(0, replay.timeline.durationMs),
    events: filterPlayerEvents(replay, playerId),
    snapshots: filterPlayerSnapshots(replay, playerId),
    checkpoints: buildSubmissionCheckpoints(playerSubmissions, startTimestamp),
  };
}
