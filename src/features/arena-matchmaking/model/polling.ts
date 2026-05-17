import { useEffect } from "react";
import type { Match } from "@/entities/match";
import type { ArenaMatchmakingState } from "./types";

export const POLL_INTERVAL_MS = 2500;

export function shouldPollState(
  state: ArenaMatchmakingState,
  currentMatch: Match | null,
  viewerId: string | null,
) {
  if (!viewerId) {
    return false;
  }

  return (
    state === "searching" ||
    state === "pending_accept" ||
    state === "accepting" ||
    state === "waiting_opponent" ||
    state === "starting" ||
    Boolean(currentMatch)
  );
}

type UseArenaPollingInput = {
  enabled: boolean;
  onPoll: () => void;
  intervalMs?: number;
};

export function useArenaPolling({
  enabled,
  onPoll,
  intervalMs = POLL_INTERVAL_MS,
}: UseArenaPollingInput) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onPoll();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, intervalMs, onPoll]);
}
