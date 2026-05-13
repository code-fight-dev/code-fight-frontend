"use client";

import { useState } from "react";
import type { ChallengeLanguage, ChallengeTestCase } from "@/entities/challenge";
import { PROGRAMMING_LANGUAGE_BY_ID } from "@/entities/challenge";
import type {
  ExecutionStatus,
  WorkspaceTab,
  ChallengeWorkspaceAction,
} from "../model/workspace";
import { CodeEditorPanel } from "./CodeEditorPanel";
import { ChallengeWorkspaceActionButton } from "./ChallengeWorkspaceActionButton";
import { ChallengeWorkspaceTabs } from "./ChallengeWorkspaceTabs";
import { LanguageSelector } from "./LanguageSelector";
import { OutputPanel } from "./OutputPanel";
import { TestcasePanel } from "./TestcasePanel";

type Props = {
  code: string;
  customInput: string;
  executionStatus: ExecutionStatus;
  isBusy: boolean;
  languages: ChallengeLanguage[];
  outputMessage: string;
  selectedLanguage: ChallengeLanguage;
  testCases: ChallengeTestCase[];
  workspaceTab: WorkspaceTab;
  onAction: (action: ChallengeWorkspaceAction) => void;
  onCodeChange: (value: string) => void;
  onCustomInputChange: (value: string) => void;
  onLanguageChange: (language: ChallengeLanguage) => void;
  onWorkspaceTabChange: (tab: WorkspaceTab) => void;
};

export function ChallengeWorkspaceEditorPanel({
  code,
  customInput,
  executionStatus,
  isBusy,
  languages,
  outputMessage,
  selectedLanguage,
  testCases,
  workspaceTab,
  onAction,
  onCodeChange,
  onCustomInputChange,
  onLanguageChange,
  onWorkspaceTabChange,
}: Props) {
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const selectedLanguageMeta = PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage];
  const safeActiveTestCaseIndex =
    activeTestCaseIndex < testCases.length ? activeTestCaseIndex : 0;

  return (
    <section className="challenge-panel flex min-h-136 flex-col overflow-hidden rounded-lg">
      <div className="challenge-panel-header flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <LanguageSelector
          languages={languages}
          value={selectedLanguage}
          onChange={onLanguageChange}
        />

        <div className="flex flex-wrap gap-2">
          <ChallengeWorkspaceActionButton
            action="run"
            disabled={isBusy}
            onClick={() => onAction("run")}
          />
          <ChallengeWorkspaceActionButton
            action="submit"
            disabled={isBusy}
            onClick={() => onAction("submit")}
          />
        </div>
      </div>

      <CodeEditorPanel
        language={selectedLanguageMeta.monacoLanguage}
        value={code}
        fileName={`solution.${selectedLanguageMeta.extension}`}
        onChange={onCodeChange}
      />

      <div className="border-t border-(--app-surface-soft-border) bg-(--app-option-bg) p-3 sm:p-4">
        <ChallengeWorkspaceTabs
          activeTab={workspaceTab}
          onTabChange={onWorkspaceTabChange}
        />

        {workspaceTab === "testcases" ? (
          <TestcasePanel
            testCases={testCases}
            activeIndex={safeActiveTestCaseIndex}
            customInput={customInput}
            onActiveIndexChange={setActiveTestCaseIndex}
            onCustomInputChange={onCustomInputChange}
          />
        ) : (
          <OutputPanel status={executionStatus} message={outputMessage} />
        )}
      </div>
    </section>
  );
}
