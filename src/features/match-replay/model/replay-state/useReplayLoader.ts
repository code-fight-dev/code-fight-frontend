"use client";

import { useEffect } from "react";
import { getChallengeByTaskId } from "@/entities/challenge/client";
import type { Challenge } from "@/entities/challenge";
import { getMatchReplay } from "@/entities/match/client";
import type { MatchReplay } from "@/entities/match";
import type { MatchReplayLoadState } from "../types";
import { DEFAULT_PLAYBACK_SPEED } from "./constants";
import { resolveInitialPlayerId } from "./helpers";

type Params = {
  matchId: string;
  viewerId: string | null;
  setLoadState: (value: MatchReplayLoadState) => void;
  setErrorMessage: (value: string | null) => void;
  setReplay: (value: MatchReplay | null) => void;
  setChallenge: (value: Challenge | null) => void;
  setActivePlayerId: (value: string | null) => void;
  setCurrentTimeMs: (value: number) => void;
  setIsPlaying: (value: boolean) => void;
  setPlaybackSpeed: (value: number) => void;
};

export function useReplayLoader({
  matchId,
  viewerId,
  setLoadState,
  setErrorMessage,
  setReplay,
  setChallenge,
  setActivePlayerId,
  setCurrentTimeMs,
  setIsPlaying,
  setPlaybackSpeed,
}: Params) {
  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setLoadState("loading");
      setErrorMessage(null);
      setReplay(null);
      setChallenge(null);
      setActivePlayerId(null);
      setCurrentTimeMs(0);
      setIsPlaying(false);
      setPlaybackSpeed(DEFAULT_PLAYBACK_SPEED);

      try {
        const replayData = await getMatchReplay(matchId);
        if (isCancelled) {
          return;
        }

        if (!replayData.permissions.canViewReplay) {
          setLoadState("error");
          setErrorMessage("You do not have permission to view this replay.");
          return;
        }

        let nextChallenge: Challenge | null = null;
        if (replayData.match.taskId) {
          try {
            nextChallenge = await getChallengeByTaskId(replayData.match.taskId);
          } catch {
            nextChallenge = null;
          }
        }
        if (isCancelled) {
          return;
        }

        setReplay(replayData);
        setChallenge(nextChallenge);
        setActivePlayerId(resolveInitialPlayerId(replayData, viewerId));
        setLoadState("ready");
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load replay.",
        );
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [
    matchId,
    setActivePlayerId,
    setChallenge,
    setCurrentTimeMs,
    setErrorMessage,
    setIsPlaying,
    setLoadState,
    setPlaybackSpeed,
    setReplay,
    viewerId,
  ]);
}
