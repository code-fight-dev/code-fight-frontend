import type { ChallengeLanguage, TaskSubmissionSummary } from "@/entities/challenge";

export type ChallengeExecutionAction = "run" | "submit";

export type ChallengeExecutionUiStatus =
  | "idle"
  | "running"
  | "ran"
  | "submitted"
  | "error";

export type ChallengeExecutionSlice = {
  taskId: string;
  languageVersions: Partial<Record<ChallengeLanguage, string>>;
  submissionHistory: TaskSubmissionSummary[];
};

export type UseChallengeExecutionParams = {
  challenge: ChallengeExecutionSlice;
  selectedLanguage: ChallengeLanguage;
  sourceCode: string;
  customInput: string;
  onOpenConsole: () => void;
};

export type UseChallengeExecutionResult = {
  executionStatus: ChallengeExecutionUiStatus;
  outputMessage: string;
  isBusy: boolean;
  submissions: TaskSubmissionSummary[];
  handleAction: (action: ChallengeExecutionAction) => void;
};
