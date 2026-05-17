"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Challenge, ChallengeLanguage, TaskSubmission } from "@/entities/challenge";
import type { Match } from "@/entities/match";
import { createMatchSubmission, getMatch } from "@/entities/match/client";
import { useViewerSession } from "@/entities/viewer";
import { bootstrapArenaRoom } from "./bootstrap";
import {
  formatSubmissionMessage,
  INITIAL_OUTPUT_MESSAGE,
  isFinalSubmissionStatus,
} from "./formatters";
import { getMatchPerspective } from "./perspective";
import { useArenaRoomPolling, useArenaRoomRealtime } from "./realtime";
import { pollSubmissionUntilFinal } from "./submission";
import { toTaskSubmissionFromMatchSubmission } from "./adapters";
import type { ArenaRoomWorkspaceTab, UseArenaRoomStateResult } from "./types";

export function useArenaRoomState(matchId: string): UseArenaRoomStateResult {
  const { viewer } = useViewerSession();
  const viewerId = viewer?.id ?? null;
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<ChallengeLanguage | null>(
    null,
  );
  const [codeByLanguage, setCodeByLanguage] = useState<
    Partial<Record<ChallengeLanguage, string>>
  >({});
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "running" | "submitted" | "error"
  >("idle");
  const [outputMessage, setOutputMessage] = useState(INITIAL_OUTPUT_MESSAGE);
  const [activeWorkspaceTab, setActiveWorkspaceTab] =
    useState<ArenaRoomWorkspaceTab>("testcases");
  const [ownSubmission, setOwnSubmission] = useState<TaskSubmission | null>(null);
  const isMountedRef = useRef(true);
  const submissionAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      submissionAbortRef.current?.abort();
      submissionAbortRef.current = null;
    };
  }, []);

  const applyMatchSnapshot = useCallback((nextMatch: Match) => {
    setMatch(nextMatch);

    if (nextMatch.status === "finished") {
      setOutputMessage((current) =>
        current.includes("Match finished")
          ? current
          : `${current}\n\nMatch finished. Final score is locked.`,
      );
    }
  }, []);

  const refreshMatch = useCallback(async () => {
    const normalizedMatchID = matchId.trim();
    if (!normalizedMatchID) {
      return;
    }

    const nextMatch = await getMatch(normalizedMatchID);
    if (!isMountedRef.current) {
      return;
    }

    applyMatchSnapshot(nextMatch);
  }, [applyMatchSnapshot, matchId]);

  useEffect(() => {
    if (!viewerId) {
      setLoadState("error");
      setErrorMessage("You need to sign in to enter arena match rooms.");
      return;
    }

    let isCancelled = false;

    const bootstrap = async () => {
      setLoadState("loading");
      setErrorMessage(null);

      try {
        const result = await bootstrapArenaRoom(matchId);
        if (isCancelled || !isMountedRef.current) {
          return;
        }

        setMatch(result.match);
        setChallenge(result.challenge);
        setSelectedLanguage(result.initialLanguage);
        setCodeByLanguage(result.initialCodeByLanguage);
        setSubmissionStatus("idle");
        setOutputMessage(INITIAL_OUTPUT_MESSAGE);
        setOwnSubmission(null);
        setLoadState("ready");
      } catch (error) {
        if (isCancelled || !isMountedRef.current) {
          return;
        }

        setLoadState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load arena room.",
        );
      }
    };

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [matchId, viewerId]);

  useArenaRoomRealtime({
    viewerId,
    matchId,
    onMatchSnapshot: applyMatchSnapshot,
  });

  useArenaRoomPolling({
    enabled: loadState === "ready" && Boolean(match) && match?.status === "running",
    onPoll: () => {
      void refreshMatch().catch(() => {
        // Poll failures are tolerated while realtime updates continue.
      });
    },
  });

  const currentCode = selectedLanguage ? (codeByLanguage[selectedLanguage] ?? "") : "";

  const submitSolution = useCallback(async () => {
    if (loadState !== "ready" || !match || !challenge || !selectedLanguage) {
      return;
    }

    if (match.status !== "running") {
      setSubmissionStatus("error");
      setOutputMessage("Match is no longer running, submission is disabled.");
      return;
    }

    const languageVersion = challenge.languageVersions[selectedLanguage];
    if (!languageVersion) {
      setSubmissionStatus("error");
      setOutputMessage(`Language version is not configured for ${selectedLanguage}.`);
      return;
    }

    submissionAbortRef.current?.abort();
    submissionAbortRef.current = null;

    setSubmissionStatus("running");
    setActiveWorkspaceTab("console");
    setOutputMessage(
      `Submission queued for ${selectedLanguage} ${languageVersion}. Waiting for judge...`,
    );

    try {
      const createdSubmission = await createMatchSubmission(match.id, {
        language: selectedLanguage,
        languageVersion,
        sourceCode: currentCode,
      });
      const createdTaskSubmission =
        toTaskSubmissionFromMatchSubmission(createdSubmission);

      if (!isMountedRef.current) {
        return;
      }

      setOwnSubmission(createdTaskSubmission);
      setOutputMessage(formatSubmissionMessage(createdTaskSubmission));

      const { submission, timedOut } = await pollSubmissionUntilFinal({
        initialSubmission: createdTaskSubmission,
        isMounted: () => isMountedRef.current,
        onUpdate: (latestSubmission) => {
          setOwnSubmission(latestSubmission);
          setOutputMessage(formatSubmissionMessage(latestSubmission));
        },
        setAbortController: (controller) => {
          submissionAbortRef.current = controller;
        },
      });

      if (!isMountedRef.current) {
        return;
      }

      setOwnSubmission(submission);
      setSubmissionStatus(
        submission.status === "failed" || !isFinalSubmissionStatus(submission.status)
          ? "error"
          : "submitted",
      );
      setOutputMessage(formatSubmissionMessage(submission, { timedOut }));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const message = error instanceof Error ? error.message : "Submission failed";
      setSubmissionStatus("error");
      setOutputMessage(message);
    } finally {
      submissionAbortRef.current = null;
    }
  }, [challenge, currentCode, loadState, match, selectedLanguage]);

  const perspective = useMemo(
    () => getMatchPerspective(match, viewerId),
    [match, viewerId],
  );

  return {
    viewerId,
    loadState,
    errorMessage,
    match,
    challenge,
    selectedLanguage,
    currentCode,
    submissionStatus,
    outputMessage,
    activeWorkspaceTab,
    ownSubmission,
    isSubmitting: submissionStatus === "running",
    selfScore: perspective.selfScore,
    opponentScore: perspective.opponentScore,
    selfAttempts: perspective.selfAttempts,
    opponentAttempts: perspective.opponentAttempts,
    selfSolved: perspective.selfSolved,
    opponentSolved: perspective.opponentSolved,
    setActiveWorkspaceTab,
    setSelectedLanguage: (language) => {
      setSelectedLanguage(language);
      setCodeByLanguage((current) => ({
        ...current,
        [language]: current[language] ?? challenge?.starterCodeByLanguage[language] ?? "",
      }));
    },
    setCurrentCode: (value) => {
      if (!selectedLanguage) {
        return;
      }

      setCodeByLanguage((current) => ({
        ...current,
        [selectedLanguage]: value,
      }));
    },
    submitSolution,
    refreshMatch,
  };
}
