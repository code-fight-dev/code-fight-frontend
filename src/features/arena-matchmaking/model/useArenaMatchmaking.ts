"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Match } from "@/entities/match";
import { getCurrentMatch } from "@/entities/match/client";
import { useViewerSession } from "@/entities/viewer";
import {
  acceptMatchmakingMatch,
  cancelMatchmakingQueue,
  joinMatchmakingQueue,
} from "./actions";
import { shouldPollState, useArenaPolling } from "./polling";
import { getMatchVersion, getReadyState, toPendingState } from "./reconcile";
import { useArenaRealtime } from "./realtime";
import {
  getAcceptRemainingSeconds,
  getSearchElapsedSeconds,
  shouldTickNow,
} from "./timers";
import type {
  ArenaMatchmakingState,
  ArenaQueueSettings,
  UseArenaMatchmakingResult,
} from "./types";

type MatchSnapshotSource = "sse" | "poll" | "action" | "bootstrap";

export function useArenaMatchmaking(): UseArenaMatchmakingResult {
  const { viewer } = useViewerSession();
  const viewerId = viewer?.id ?? null;
  const isGuest = !viewerId;
  const [state, setState] = useState<ArenaMatchmakingState>("idle");
  const [queueSettings, setQueueSettings] = useState<ArenaQueueSettings>({
    taskMode: "normal",
    isRated: true,
  });
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [searchStartedAt, setSearchStartedAt] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const stateRef = useRef<ArenaMatchmakingState>("idle");
  const currentMatchRef = useRef<Match | null>(null);
  const latestSnapshotVersionRef = useRef(0);
  const nullPollsRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    currentMatchRef.current = currentMatch;
  }, [currentMatch]);

  const setIdle = useCallback((options?: { toastMessage?: string }) => {
    currentMatchRef.current = null;
    setCurrentMatch(null);
    setSearchStartedAt(null);
    setState("idle");
    setErrorMessage(null);
    nullPollsRef.current = 0;

    if (options?.toastMessage) {
      setToastMessage(options.toastMessage);
    }
  }, []);

  const reconcileRunningMatch = useCallback((match: Match) => {
    if (match.status !== "running") {
      return false;
    }

    currentMatchRef.current = match;
    setState("starting");
    setCurrentMatch(match);
    setSearchStartedAt(null);
    setErrorMessage(null);

    return true;
  }, []);

  const reconcileMatchSnapshot = useCallback(
    (match: Match, source: MatchSnapshotSource) => {
      const snapshotVersion = getMatchVersion(match);

      if (
        source !== "action" &&
        source !== "bootstrap" &&
        snapshotVersion < latestSnapshotVersionRef.current
      ) {
        return;
      }

      latestSnapshotVersionRef.current = snapshotVersion;
      nullPollsRef.current = 0;

      if (reconcileRunningMatch(match)) {
        return;
      }

      if (match.status === "pending") {
        currentMatchRef.current = match;
        setCurrentMatch(match);
        setSearchStartedAt(null);
        setErrorMessage(null);
        setState(toPendingState(match, viewerId));
        return;
      }

      if (match.status === "cancelled") {
        setIdle({
          toastMessage: stateRef.current !== "idle" ? "Match was cancelled." : undefined,
        });
        return;
      }

      if (match.status === "finished") {
        setIdle();
      }
    },
    [reconcileRunningMatch, setIdle, viewerId],
  );

  const reconcileNoMatchSnapshot = useCallback(
    (source: "poll" | "bootstrap") => {
      if (stateRef.current === "searching") {
        return;
      }

      if (currentMatchRef.current && source === "poll") {
        nullPollsRef.current += 1;
        if (nullPollsRef.current < 2) {
          return;
        }
      }

      setIdle();
    },
    [setIdle],
  );

  const refreshCurrentMatch = useCallback(
    async (source: "poll" | "bootstrap") => {
      try {
        const { match } = await getCurrentMatch();
        if (match) {
          reconcileMatchSnapshot(match, source);
          return;
        }

        reconcileNoMatchSnapshot(source);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to sync match";
        setState("error");
        setErrorMessage(message);
      }
    },
    [reconcileMatchSnapshot, reconcileNoMatchSnapshot],
  );

  useEffect(() => {
    if (!viewerId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void refreshCurrentMatch("bootstrap");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refreshCurrentMatch, viewerId]);

  useArenaRealtime({
    viewerId,
    onConnected: setIsSseConnected,
    onQueued: () => {
      if (stateRef.current === "idle") {
        setState("searching");
        setSearchStartedAt(Date.now());
      }
    },
    onMatchSnapshot: reconcileMatchSnapshot,
  });

  const shouldPoll = useMemo(
    () => shouldPollState(state, currentMatch, viewerId),
    [currentMatch, state, viewerId],
  );

  useArenaPolling({
    enabled: shouldPoll,
    onPoll: () => {
      void refreshCurrentMatch("poll");
    },
  });

  useEffect(() => {
    if (!shouldTickNow(state)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state]);

  const searchElapsedSeconds = useMemo(
    () => getSearchElapsedSeconds(now, searchStartedAt),
    [now, searchStartedAt],
  );

  const acceptRemainingSeconds = useMemo(
    () => getAcceptRemainingSeconds(now, currentMatch),
    [currentMatch, now],
  );

  const runningMatchId = useMemo(
    () => (currentMatch?.status === "running" ? currentMatch.id : null),
    [currentMatch],
  );

  const { selfAccepted, opponentAccepted } = useMemo(
    () => getReadyState(currentMatch, viewerId),
    [currentMatch, viewerId],
  );

  const startMatchmaking = useCallback(async () => {
    if (!viewerId) {
      return;
    }

    setState("searching");
    setSearchStartedAt(Date.now());
    setErrorMessage(null);

    try {
      const queueResult = await joinMatchmakingQueue({
        taskMode: queueSettings.taskMode,
        isRated: queueSettings.isRated,
        ratingMode: "global",
      });

      if (queueResult.match) {
        reconcileMatchSnapshot(queueResult.match, "action");
        return;
      }

      currentMatchRef.current = null;
      setCurrentMatch(null);
      setState("searching");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start matchmaking";

      setState("error");
      setErrorMessage(message);
    }
  }, [queueSettings.isRated, queueSettings.taskMode, reconcileMatchSnapshot, viewerId]);

  const cancelMatchmaking = useCallback(async () => {
    if (!viewerId) {
      return;
    }

    try {
      await cancelMatchmakingQueue();
      setIdle({
        toastMessage: "Matchmaking cancelled.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel queue";
      setState("error");
      setErrorMessage(message);
    }
  }, [setIdle, viewerId]);

  const acceptMatch = useCallback(async () => {
    const currentMatch = currentMatchRef.current;

    if (!viewerId || !currentMatch) {
      return;
    }

    setState("accepting");
    setErrorMessage(null);

    try {
      const updatedMatch = await acceptMatchmakingMatch(currentMatch.id);
      reconcileMatchSnapshot(updatedMatch, "action");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to accept match";
      setState("error");
      setErrorMessage(message);
    }
  }, [reconcileMatchSnapshot, viewerId]);

  return {
    viewerId,
    state,
    queueSettings,
    currentMatch,
    runningMatchId,
    searchElapsedSeconds,
    acceptRemainingSeconds,
    isSseConnected,
    isBusy: state === "accepting" || state === "starting",
    isGuest,
    selfAccepted,
    opponentAccepted,
    errorMessage,
    toastMessage,
    setTaskMode: (taskMode) =>
      setQueueSettings((current) => ({
        ...current,
        taskMode,
      })),
    setIsRated: (isRated) =>
      setQueueSettings((current) => ({
        ...current,
        isRated,
      })),
    startMatchmaking,
    cancelMatchmaking,
    acceptMatch,
    clearToast: () => setToastMessage(null),
  };
}
