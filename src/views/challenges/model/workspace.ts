import {
  DEFAULT_CHALLENGE_LANGUAGE,
  type Challenge,
  type ChallengeLanguage,
} from "@/entities/challenge";

export type WorkspaceTab = "testcases" | "console";
export type ChallengeProblemTab = "description" | "editorial" | "submissions";
export type ChallengeWorkspaceAction = "run" | "submit";
export type ExecutionStatus = "idle" | "running" | "ran" | "submitted";

export const WORKSPACE_TABS: Array<{ value: WorkspaceTab; label: string }> = [
  { value: "testcases", label: "Testcases" },
  { value: "console", label: "Console" },
];

export const DEFAULT_OUTPUT_MESSAGE =
  "Choose a testcase, draft a solution, then run or submit when execution is available.";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getInitialChallengeLanguage(challenge: Challenge) {
  if (challenge.supportedLanguages.includes(DEFAULT_CHALLENGE_LANGUAGE)) {
    return DEFAULT_CHALLENGE_LANGUAGE;
  }

  return challenge.supportedLanguages[0] ?? DEFAULT_CHALLENGE_LANGUAGE;
}

export function getInitialCodeByLanguage(challenge: Challenge) {
  return { ...challenge.starterCodeByLanguage } as Partial<
    Record<ChallengeLanguage, string>
  >;
}

export function getWorkspaceActionLabel(action: ChallengeWorkspaceAction) {
  return action === "run" ? "Run Code" : "Submit";
}
