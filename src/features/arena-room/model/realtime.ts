import { useEffect } from "react";
import type { Match } from "@/entities/match";
import { subscribeArenaEvents } from "@/entities/match/client";

export const MATCH_POLL_INTERVAL_MS = 2500;

type UseArenaRoomRealtimeInput = {
  viewerId: string | null;
  matchId: string;
  onMatchSnapshot: (match: Match) => void;
};

export function useArenaRoomRealtime({
  viewerId,
  matchId,
  onMatchSnapshot,
}: UseArenaRoomRealtimeInput) {
  useEffect(() => {
    if (!viewerId) {
      return;
    }

    const normalizedMatchID = matchId.trim();
    if (!normalizedMatchID) {
      return;
    }

    const unsubscribe = subscribeArenaEvents({
      onEvent: (event) => {
        if (event.type === "connected" || event.type === "matchmaking.queued") {
          return;
        }

        if (event.data.id !== normalizedMatchID) {
          return;
        }

        onMatchSnapshot(event.data);
      },
    });

    return unsubscribe;
  }, [matchId, onMatchSnapshot, viewerId]);
}

type UseArenaRoomPollingInput = {
  enabled: boolean;
  onPoll: () => void;
};

export function useArenaRoomPolling({ enabled, onPoll }: UseArenaRoomPollingInput) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onPoll();
    }, MATCH_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, onPoll]);
}
