export type MatchReplayLoadState = "loading" | "ready" | "error";

export type ReplayMatchInfo = {
  id: string;
  status: string;
  taskId: string | null;
};

export type ReplayChallengeInfo = {
  title: string;
  summary: string | null;
};

export type ReplayPlayer = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
};

export type MatchReplayCheckpoint = {
  id: string;
  label: string;
  tMs: number;
  submissionId?: string;
  verdict?: string;
  status?: string;
  score?: number;
  createdAt?: string;
};

export type ReplayViewState = {
  timeMs: number;
  language: string;
  sourceCode: string;
  checkpointIndex: number;
  currentCheckpoint?: MatchReplayCheckpoint;
};

export type UseMatchReplayStateResult = {
  loadState: MatchReplayLoadState;
  errorMessage: string | null;
  playbackErrorMessage: string | null;
  match: ReplayMatchInfo | null;
  challenge: ReplayChallengeInfo | null;
  canViewReplay: boolean;
  canViewSourceCode: boolean;
  players: ReplayPlayer[];
  activePlayerId: string | null;
  checkpoints: MatchReplayCheckpoint[];
  currentCheckpointIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  currentCode: string;
  currentLanguage: string;
  currentTimeMs: number;
  durationMs: number;
  setActivePlayerId: (playerId: string) => void;
  seekToTime: (timeMs: number) => void;
  seekToCheckpoint: (index: number) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (value: number) => void;
};
