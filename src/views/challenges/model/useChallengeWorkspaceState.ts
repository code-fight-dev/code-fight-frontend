"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useMemo, useRef, useState } from "react";
import type { Challenge, ChallengeLanguage } from "@/entities/challenge";
import { useChallengeExecution } from "@/features/challenge-execution";
import {
  clamp,
  getInitialChallengeLanguage,
  getInitialCodeByLanguage,
  type ChallengeProblemTab,
  type WorkspaceTab,
} from "./workspace";

export function useChallengeWorkspaceState(challenge: Challenge) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(43);
  const [problemTab, setProblemTab] = useState<ChallengeProblemTab>("description");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("testcases");
  const [customInput, setCustomInput] = useState("");

  const initialLanguage = useMemo(
    () => getInitialChallengeLanguage(challenge),
    [challenge],
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<ChallengeLanguage>(initialLanguage);
  const [codeByLanguage, setCodeByLanguage] = useState(() =>
    getInitialCodeByLanguage(challenge),
  );

  const currentCode = codeByLanguage[selectedLanguage] ?? "";
  const workspaceStyle = {
    "--challenge-left-panel": `${leftPanelWidth}%`,
  } as CSSProperties;

  const { executionStatus, outputMessage, isBusy, submissions, handleAction } =
    useChallengeExecution({
      challenge: {
        taskId: challenge.taskId,
        languageVersions: challenge.languageVersions,
        submissionHistory: challenge.submissionHistory,
      },
      selectedLanguage,
      sourceCode: currentCode,
      customInput,
      onOpenConsole: () => setWorkspaceTab("console"),
    });

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
    currentCode,
    customInput,
    executionStatus,
    handleAction,
    handleCodeChange,
    handleLanguageChange,
    handleResizeStart,
    isBusy,
    outputMessage,
    problemTab,
    selectedLanguage,
    setCustomInput,
    setProblemTab,
    setWorkspaceTab,
    shellRef,
    submissions,
    workspaceStyle,
    workspaceTab,
  };
}
