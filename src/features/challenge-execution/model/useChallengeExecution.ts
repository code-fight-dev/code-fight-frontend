"use client";

import { useEffect, useRef, useState } from "react";
import {
  PROGRAMMING_LANGUAGE_BY_ID,
  toTaskSubmissionSummary,
  type CodeRun,
  type TaskSubmission,
} from "@/entities/challenge";
import {
  createTaskRun,
  createTaskSubmission,
  getCodeRun,
  getSubmission,
} from "@/entities/challenge/client";
import {
  DEFAULT_EXECUTION_OUTPUT_MESSAGE,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
  getActionFailureMessage,
  getExecutionActionLabel,
  getExecutionSummaryLines,
  isAbortError,
  isFinalExecutionStatus,
  sortSubmissions,
  upsertSubmission,
} from "./helpers";
import type {
  ChallengeExecutionAction,
  ChallengeExecutionUiStatus,
  UseChallengeExecutionParams,
  UseChallengeExecutionResult,
} from "./types";

export function useChallengeExecution({
  challenge,
  selectedLanguage,
  sourceCode,
  customInput,
  onOpenConsole,
}: UseChallengeExecutionParams): UseChallengeExecutionResult {
  const pollingTimeoutRef = useRef<number | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const [executionStatus, setExecutionStatus] =
    useState<ChallengeExecutionUiStatus>("idle");
  const [outputMessage, setOutputMessage] = useState(DEFAULT_EXECUTION_OUTPUT_MESSAGE);
  const [submissions, setSubmissions] = useState(() =>
    sortSubmissions(challenge.submissionHistory),
  );

  const isBusy = executionStatus === "running";

  useEffect(() => {
    setSubmissions(sortSubmissions(challenge.submissionHistory));
  }, [challenge.submissionHistory]);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;

      if (pollingTimeoutRef.current) {
        window.clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, []);

  async function waitForPollingInterval(signal: AbortSignal) {
    if (signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        if (pollingTimeoutRef.current) {
          window.clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }

        reject(new DOMException("Aborted", "AbortError"));
      };

      signal.addEventListener("abort", onAbort, { once: true });

      pollingTimeoutRef.current = window.setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        pollingTimeoutRef.current = null;
        resolve();
      }, POLL_INTERVAL_MS);
    });
  }

  async function pollCodeRun(
    initialRun: CodeRun,
    signal: AbortSignal,
    actionLabel: string,
    customInputProvided: boolean,
  ) {
    let latestRun = initialRun;
    if (isFinalExecutionStatus(latestRun.status)) {
      return { codeRun: latestRun, timedOut: false };
    }

    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      await waitForPollingInterval(signal);
      latestRun = await getCodeRun(latestRun.id, signal);
      setOutputMessage(
        getExecutionSummaryLines(actionLabel, latestRun, { customInputProvided }),
      );

      if (isFinalExecutionStatus(latestRun.status)) {
        return { codeRun: latestRun, timedOut: false };
      }
    }

    return { codeRun: latestRun, timedOut: true };
  }

  async function pollSubmission(
    initialSubmission: TaskSubmission,
    signal: AbortSignal,
    actionLabel: string,
  ) {
    let latestSubmission = initialSubmission;
    if (isFinalExecutionStatus(latestSubmission.status)) {
      return { submission: latestSubmission, timedOut: false };
    }

    const deadline = Date.now() + POLL_TIMEOUT_MS;

    while (Date.now() < deadline) {
      await waitForPollingInterval(signal);
      latestSubmission = await getSubmission(latestSubmission.id, signal);
      setSubmissions((current) =>
        upsertSubmission(current, toTaskSubmissionSummary(latestSubmission)),
      );
      setOutputMessage(getExecutionSummaryLines(actionLabel, latestSubmission));

      if (isFinalExecutionStatus(latestSubmission.status)) {
        return { submission: latestSubmission, timedOut: false };
      }
    }

    return { submission: latestSubmission, timedOut: true };
  }

  async function runAction(action: ChallengeExecutionAction) {
    if (isBusy) {
      return;
    }

    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    if (pollingTimeoutRef.current) {
      window.clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    onOpenConsole();

    const actionLabel = getExecutionActionLabel(action);
    const languageVersion = challenge.languageVersions[selectedLanguage];
    const customInputProvided = customInput.trim() !== "";
    const selectedLanguageMeta = PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage];

    if (!languageVersion) {
      setExecutionStatus("error");
      setOutputMessage(
        `${actionLabel} is unavailable for ${selectedLanguageMeta.label}.\n\nLanguage version is not configured for this challenge.`,
      );
      return;
    }

    const controller = new AbortController();
    requestControllerRef.current = controller;

    setExecutionStatus("running");
    setOutputMessage(
      `${actionLabel} queued for ${selectedLanguageMeta.label} ${languageVersion}.\n\nWaiting for judge queue...`,
    );

    try {
      if (action === "run") {
        const createdRun = await createTaskRun(
          challenge.taskId,
          {
            language: selectedLanguage,
            languageVersion,
            sourceCode,
            ...(customInputProvided ? { customTestInput: customInput } : {}),
          },
          controller.signal,
        );

        setOutputMessage(
          getExecutionSummaryLines(actionLabel, createdRun, { customInputProvided }),
        );

        const { codeRun, timedOut } = await pollCodeRun(
          createdRun,
          controller.signal,
          actionLabel,
          customInputProvided,
        );

        setExecutionStatus("ran");
        setOutputMessage(
          getExecutionSummaryLines(actionLabel, codeRun, {
            customInputProvided,
            timedOut,
          }),
        );
      } else {
        const createdSubmission = await createTaskSubmission(
          challenge.taskId,
          {
            language: selectedLanguage,
            languageVersion,
            sourceCode,
          },
          controller.signal,
        );

        setSubmissions((current) =>
          upsertSubmission(current, toTaskSubmissionSummary(createdSubmission)),
        );
        setOutputMessage(getExecutionSummaryLines(actionLabel, createdSubmission));

        const { submission, timedOut } = await pollSubmission(
          createdSubmission,
          controller.signal,
          actionLabel,
        );

        setSubmissions((current) =>
          upsertSubmission(current, toTaskSubmissionSummary(submission)),
        );
        setExecutionStatus("submitted");
        setOutputMessage(
          getExecutionSummaryLines(actionLabel, submission, {
            timedOut,
          }),
        );
      }
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      setExecutionStatus("error");
      setOutputMessage(getActionFailureMessage(actionLabel, error));
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
    }
  }

  function handleAction(action: ChallengeExecutionAction) {
    void runAction(action);
  }

  return {
    executionStatus,
    outputMessage,
    isBusy,
    submissions,
    handleAction,
  };
}
