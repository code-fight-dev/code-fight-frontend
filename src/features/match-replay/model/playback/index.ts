import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import { resolveViewStateAtTime } from "./resolver";
import { buildTrack } from "./track";

export function buildReplayPlaybackState(
  replay: MatchReplay,
  playerId: string,
  challenge: Challenge | null,
) {
  const track = buildTrack(replay, playerId, challenge);

  return {
    durationMs: track.durationMs,
    checkpoints: track.checkpoints,
    resolveAtTime: (targetTimeMs: number) => resolveViewStateAtTime(track, targetTimeMs),
  };
}
