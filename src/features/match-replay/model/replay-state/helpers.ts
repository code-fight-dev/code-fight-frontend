import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import type { ReplayChallengeInfo, ReplayMatchInfo, ReplayPlayer } from "../types";

export function clampTime(value: number, durationMs: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  if (value >= durationMs) {
    return durationMs;
  }

  return value;
}

export function clampIndex(value: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  if (value <= 0) {
    return 0;
  }

  if (value >= max) {
    return max;
  }

  return value;
}

export function resolveInitialPlayerId(
  replay: MatchReplay,
  viewerId: string | null,
): string | null {
  if (viewerId) {
    const selfPlayer = replay.players.find((player) => player.id === viewerId);
    if (selfPlayer) {
      return selfPlayer.id;
    }
  }

  return replay.players[0]?.id ?? null;
}

export function mapReplayPlayers(replay: MatchReplay | null): ReplayPlayer[] {
  if (!replay) {
    return [];
  }

  return replay.players.map((player) => ({
    id: player.id,
    username: player.username,
    displayName: player.displayName,
    avatarUrl: player.avatarUrl,
  }));
}

export function mapReplayMatchInfo(replay: MatchReplay | null): ReplayMatchInfo | null {
  if (!replay) {
    return null;
  }

  return {
    id: replay.match.id,
    status: replay.match.status,
    taskId: replay.match.taskId ?? null,
  };
}

export function mapReplayChallengeInfo(
  challenge: Challenge | null,
): ReplayChallengeInfo | null {
  if (!challenge) {
    return null;
  }

  return {
    title: challenge.title,
    summary: challenge.summary ?? null,
  };
}
