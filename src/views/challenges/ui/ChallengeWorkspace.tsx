"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Challenge } from "@/entities/challenge";
import { Container } from "@/shared/ui/Container";
import { useChallengeWorkspaceState } from "../model/useChallengeWorkspaceState";
import { ChallengeProblemPanel } from "./ChallengeProblemPanel";
import { ChallengeWorkspaceEditorPanel } from "./ChallengeWorkspaceEditorPanel";
import { ChallengeWorkspaceResizeHandle } from "./ChallengeWorkspaceResizeHandle";

type Props = {
  challenge: Challenge;
};

export function ChallengeWorkspace({ challenge }: Props) {
  const {
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
  } = useChallengeWorkspaceState(challenge);

  return (
    <section className="challenge-page relative overflow-hidden py-4 sm:py-5 lg:py-6">
      <div
        aria-hidden
        className="challenge-grid-layer pointer-events-none absolute inset-0 opacity-32"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,12,24,0.1)_100%)]"
      />

      <Container className="relative max-w-none 2xl:max-w-470">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/challenges"
            className="challenge-focus-ring inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) px-3 text-[13px] font-semibold text-(--app-text-muted) transition-colors hover:border-(--app-option-active-border) hover:text-(--app-text-strong)"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
            All challenges
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[12px] text-(--app-text-faint)">
            <span className="challenge-panel-muted rounded-md px-2.5 py-1.5">
              {challenge.acceptanceRate}% accepted
            </span>
            <span className="challenge-panel-muted rounded-md px-2.5 py-1.5">
              {challenge.attempts.toLocaleString()} attempts
            </span>
          </div>
        </div>

        <div
          ref={shellRef}
          className="grid min-h-[calc(100dvh-10rem)] gap-3 lg:grid-cols-[minmax(22rem,var(--challenge-left-panel))_0.5rem_minmax(27rem,1fr)]"
          style={workspaceStyle}
        >
          <ChallengeProblemPanel
            challenge={challenge}
            activeTab={problemTab}
            submissions={submissions}
            onTabChange={setProblemTab}
          />

          <ChallengeWorkspaceResizeHandle onResizeStart={handleResizeStart} />

          <ChallengeWorkspaceEditorPanel
            code={currentCode}
            customInput={customInput}
            executionStatus={executionStatus}
            isBusy={isBusy}
            languages={challenge.supportedLanguages}
            outputMessage={outputMessage}
            selectedLanguage={selectedLanguage}
            testCases={challenge.testCases}
            workspaceTab={workspaceTab}
            onAction={handleAction}
            onCodeChange={handleCodeChange}
            onCustomInputChange={setCustomInput}
            onLanguageChange={handleLanguageChange}
            onWorkspaceTabChange={setWorkspaceTab}
          />
        </div>
      </Container>
    </section>
  );
}
