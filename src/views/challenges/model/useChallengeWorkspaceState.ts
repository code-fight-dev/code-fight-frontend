"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROGRAMMING_LANGUAGE_BY_ID,
  type Challenge,
  type ChallengeLanguage,
} from "@/entities/challenge";
import {
  clamp,
  DEFAULT_OUTPUT_MESSAGE,
  getInitialChallengeLanguage,
  getInitialCodeByLanguage,
  getWorkspaceActionLabel,
  type ChallengeProblemTab,
  type ChallengeWorkspaceAction,
  type ExecutionStatus,
  type WorkspaceTab,
} from "./workspace";

export function useChallengeWorkspaceState(challenge: Challenge) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(43);
  const [problemTab, setProblemTab] = useState<ChallengeProblemTab>("description");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("testcases");
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [outputMessage, setOutputMessage] = useState(DEFAULT_OUTPUT_MESSAGE);

  const initialLanguage = useMemo(
    () => getInitialChallengeLanguage(challenge),
    [challenge],
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<ChallengeLanguage>(initialLanguage);
  const [codeByLanguage, setCodeByLanguage] = useState(() =>
    getInitialCodeByLanguage(challenge),
  );

  const selectedLanguageMeta = PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage];
  const currentCode = codeByLanguage[selectedLanguage] ?? "";
  const isBusy = executionStatus === "running";
  const workspaceStyle = {
    "--challenge-left-panel": `${leftPanelWidth}%`,
  } as CSSProperties;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleLanguageChange(language: ChallengeLanguage) {
    setSelectedLanguage(language);
    setCodeByLanguage((currentCodeByLanguage) => ({
      ...currentCodeByLanguage,
      [language]:
        currentCodeByLanguage[language] ??
        challenge.starterCodeByLanguage[language] ??
        "",
    }));
  }

  function handleCodeChange(value: string) {
    setCodeByLanguage((currentCodeByLanguage) => ({
      ...currentCodeByLanguage,
      [selectedLanguage]: value,
    }));
  }

  function showMockResult(action: ChallengeWorkspaceAction) {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const activeTestCase =
      challenge.testCases[activeTestCaseIndex] ?? challenge.testCases[0];
    const actionLabel = getWorkspaceActionLabel(action);

    setWorkspaceTab("console");
    setExecutionStatus("running");
    setOutputMessage(
      `${actionLabel} queued for ${selectedLanguageMeta.label}.\n\nPreparing sample input...`,
    );

    timeoutRef.current = window.setTimeout(() => {
      const nextStatus: ExecutionStatus = action === "run" ? "ran" : "submitted";
      const testcaseLine = activeTestCase
        ? `Selected testcase: ${activeTestCase.name}\nExpected output: ${activeTestCase.expectedOutput}`
        : "No sample testcase selected.";

      setExecutionStatus(nextStatus);
      setOutputMessage(
        `${actionLabel} is ready for the execution service.\n\n${testcaseLine}\n\nExecution is not connected yet.`,
      );
    }, 700);
  }

  function handleResizeStart(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();

    const onPointerMove = (moveEvent: PointerEvent) => {
      const shell = shellRef.current;

      if (!shell) {
        return;
      }

      const rect = shell.getBoundingClientRect();
      const nextWidth = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setLeftPanelWidth(clamp(nextWidth, 34, 58));
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  }

  return {
    activeTestCaseIndex,
    currentCode,
    customInput,
    executionStatus,
    handleCodeChange,
    handleLanguageChange,
    handleResizeStart,
    isBusy,
    outputMessage,
    problemTab,
    selectedLanguage,
    selectedLanguageMeta,
    setActiveTestCaseIndex,
    setCustomInput,
    setProblemTab,
    setWorkspaceTab,
    shellRef,
    showMockResult,
    workspaceStyle,
    workspaceTab,
  };
}
