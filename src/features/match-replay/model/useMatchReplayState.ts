"use client";

import { useMemo, useState } from "react";
import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import { useViewerSession } from "@/entities/viewer";
import { buildReplayPlaybackState } from "./playback";
import { DEFAULT_PLAYBACK_SPEED } from "./replay-state/constants";
import {
  clampIndex,
  clampTime,
  mapReplayChallengeInfo,
  mapReplayMatchInfo,
  mapReplayPlayers,
} from "./replay-state/helpers";
import { useReplayClock } from "./replay-state/useReplayClock";
import { useReplayLoader } from "./replay-state/useReplayLoader";
import type { MatchReplayLoadState, UseMatchReplayStateResult } from "./types";

export function useMatchReplayState(matchId: string): UseMatchReplayStateResult {
  const { viewer } = useViewerSession();
  const viewerId = viewer?.id ?? null;
  const [loadState, setLoadState] = useState<MatchReplayLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replay, setReplay] = useState<MatchReplay | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [activePlayerId, setActivePlayerIdState] = useState<string | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);

  useReplayLoader({
    matchId,
    viewerId,
    setLoadState,
    setErrorMessage,
    setReplay,
    setChallenge,
    setActivePlayerId: setActivePlayerIdState,
    setCurrentTimeMs,
    setIsPlaying,
    setPlaybackSpeed,
  });

  const players = useMemo(() => mapReplayPlayers(replay), [replay]);

  const playbackBuildResult = useMemo(() => {
    if (!replay || !activePlayerId) {
      return { playback: null, playbackErrorMessage: null as string | null };
    }

    try {
      return {
        playback: buildReplayPlaybackState(replay, activePlayerId, challenge),
        playbackErrorMessage: null as string | null,
      };
    } catch (error) {
      return {
        playback: null,
        playbackErrorMessage:
          error instanceof Error ? error.message : "Replay timeline is invalid.",
      };
    }
  }, [activePlayerId, challenge, replay]);
  const playback = playbackBuildResult.playback;

  const checkpoints = playback?.checkpoints ?? [];
  const durationMs =
    playback?.durationMs ?? Math.max(0, replay?.timeline.durationMs ?? 0);
  const safeCurrentTimeMs = clampTime(currentTimeMs, durationMs);
  const viewStateResult = useMemo(() => {
    if (!playback) {
      return { viewState: null, playbackErrorMessage: null as string | null };
    }

    try {
      return {
        viewState: playback.resolveAtTime(safeCurrentTimeMs),
        playbackErrorMessage: null as string | null,
      };
    } catch (error) {
      return {
        viewState: null,
        playbackErrorMessage:
          error instanceof Error ? error.message : "Replay timeline is invalid.",
      };
    }
  }, [playback, safeCurrentTimeMs]);

  const playbackErrorMessage =
    playbackBuildResult.playbackErrorMessage ?? viewStateResult.playbackErrorMessage;

  const currentViewState = viewStateResult.viewState;
  const currentCheckpointIndex = currentViewState?.checkpointIndex ?? 0;
  const canViewReplay = replay?.permissions.canViewReplay ?? false;
  const canViewSourceCode = replay?.permissions.canViewSourceCode ?? false;

  useReplayClock({
    isPlaying,
    durationMs,
    safeCurrentTimeMs,
    playbackSpeed,
    setCurrentTimeMs,
    setIsPlaying,
  });

  return {
    loadState,
    errorMessage,
    playbackErrorMessage,
    match: mapReplayMatchInfo(replay),
    challenge: mapReplayChallengeInfo(challenge),
    canViewReplay,
    canViewSourceCode,
    players,
    activePlayerId,
    checkpoints,
    currentCheckpointIndex: clampIndex(
      currentCheckpointIndex,
      Math.max(0, checkpoints.length - 1),
    ),
    isPlaying,
    playbackSpeed,
    currentCode: canViewSourceCode ? (currentViewState?.sourceCode ?? "") : "",
    currentLanguage: canViewSourceCode
      ? (currentViewState?.language ?? "typescript")
      : "hidden",
    currentTimeMs: safeCurrentTimeMs,
    durationMs,
    setActivePlayerId: (playerId) => {
      setActivePlayerIdState(playerId);
      setCurrentTimeMs(0);
      setIsPlaying(false);
    },
    seekToTime: (timeMs) => {
      setCurrentTimeMs(clampTime(timeMs, durationMs));
      setIsPlaying(false);
    },
    seekToCheckpoint: (index) => {
      const safeIndex = clampIndex(index, Math.max(0, checkpoints.length - 1));
      const checkpoint = checkpoints[safeIndex];
      if (!checkpoint) {
        return;
      }

      setCurrentTimeMs(clampTime(checkpoint.tMs, durationMs));
      setIsPlaying(false);
    },
    togglePlayback: () => {
      if (durationMs <= 0) {
        return;
      }

      if (safeCurrentTimeMs >= durationMs) {
        setCurrentTimeMs(0);
        setIsPlaying(true);
        return;
      }

      setIsPlaying((previous) => !previous);
    },
    setPlaybackSpeed: (value) => {
      if (!Number.isFinite(value) || value <= 0) {
        return;
      }

      setPlaybackSpeed(value);
    },
  };
}
