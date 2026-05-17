import { useEffect } from "react";
import { subscribeArenaEvents } from "@/entities/match/client";
import type { Match } from "@/entities/match";

type MatchSnapshotSource = "sse" | "poll" | "action" | "bootstrap";

type UseArenaRealtimeInput = {
  viewerId: string | null;
  onConnected: (connected: boolean) => void;
  onQueued: () => void;
  onMatchSnapshot: (match: Match, source: MatchSnapshotSource) => void;
};

export function useArenaRealtime({
  viewerId,
  onConnected,
  onQueued,
  onMatchSnapshot,
}: UseArenaRealtimeInput) {
  useEffect(() => {
    if (!viewerId) {
      return;
    }

    const unsubscribe = subscribeArenaEvents({
      onOpen: () => {
        onConnected(true);
      },
      onError: () => {
        onConnected(false);
      },
      onEvent: (event) => {
        if (event.type === "connected") {
          onConnected(event.data.ok);
          return;
        }

        if (event.type === "matchmaking.queued") {
          onQueued();
          return;
        }

        onMatchSnapshot(event.data, "sse");
      },
    });

    return unsubscribe;
  }, [onConnected, onMatchSnapshot, onQueued, viewerId]);
}
