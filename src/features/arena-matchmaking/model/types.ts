import type { Match } from "@/entities/match";

export type ArenaMatchmakingState =
  | "idle"
  | "searching"
  | "pending_accept"
  | "accepting"
  | "waiting_opponent"
  | "starting"
  | "error";

export type ArenaQueueSettings = {
  taskMode: "normal" | "hard";
  isRated: boolean;
};

export type UseArenaMatchmakingResult = {
  viewerId: string | null;
  state: ArenaMatchmakingState;
  queueSettings: ArenaQueueSettings;
  currentMatch: Match | null;
  runningMatchId: string | null;
  searchElapsedSeconds: number;
  acceptRemainingSeconds: number;
  isSseConnected: boolean;
  isBusy: boolean;
  isGuest: boolean;
  selfAccepted: boolean;
  opponentAccepted: boolean;
  errorMessage: string | null;
  toastMessage: string | null;
  setTaskMode: (taskMode: ArenaQueueSettings["taskMode"]) => void;
  setIsRated: (isRated: boolean) => void;
  startMatchmaking: () => Promise<void>;
  cancelMatchmaking: () => Promise<void>;
  acceptMatch: () => Promise<void>;
  clearToast: () => void;
};
