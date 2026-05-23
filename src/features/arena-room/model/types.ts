import type { Challenge, ChallengeLanguage, TaskSubmission } from "@/entities/challenge";
import type { Match } from "@/entities/match";

export type ArenaRoomLoadState = "loading" | "ready" | "error";
export type ArenaRoomWorkspaceTab = "testcases" | "console";

export type UseArenaRoomStateResult = {
  viewerId: string | null;
  loadState: ArenaRoomLoadState;
  errorMessage: string | null;
  match: Match | null;
  challenge: Challenge | null;
  selectedLanguage: ChallengeLanguage | null;
  currentCode: string;
  submissionStatus: "idle" | "running" | "submitted" | "error";
  outputMessage: string;
  activeWorkspaceTab: ArenaRoomWorkspaceTab;
  ownSubmission: TaskSubmission | null;
  isSubmitting: boolean;
  isSurrendering: boolean;
  selfScore: number;
  opponentScore: number;
  selfAttempts: number;
  opponentAttempts: number;
  selfSolved: boolean;
  opponentSolved: boolean;
  setActiveWorkspaceTab: (tab: ArenaRoomWorkspaceTab) => void;
  setSelectedLanguage: (language: ChallengeLanguage) => void;
  setCurrentCode: (value: string) => void;
  submitSolution: () => Promise<void>;
  surrenderMatch: () => Promise<void>;
  refreshMatch: () => Promise<void>;
};
