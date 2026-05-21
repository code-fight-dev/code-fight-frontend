export type MatchStatus = "pending" | "running" | "finished" | "cancelled";
export type MatchTaskMode = "normal" | "hard";
export type MatchTaskDifficulty = "easy" | "medium" | "hard";
export type MatchJudgeStatus =
  | "not_started"
  | "ready"
  | "running"
  | "finished"
  | "failed";
export type MatchResultType = "player1_win" | "player2_win" | "draw" | "cancelled";
export type MatchWinningReason =
  | "accepted_faster"
  | "accepted_more_tests"
  | "opponent_failed"
  | "surrender"
  | "draw"
  | "cancelled";

export type Match = {
  id: string;
  ratingMode: string;
  taskMode: MatchTaskMode;
  taskId?: string;
  taskDifficultySnapshot?: MatchTaskDifficulty;
  player1Id: string;
  player2Id: string;
  player1Ready: boolean;
  player2Ready: boolean;
  winnerId?: string;
  status: MatchStatus;
  judgeStatus: MatchJudgeStatus;
  resultType?: MatchResultType;
  winningReason?: MatchWinningReason;
  isRated: boolean;
  ratingApplied: boolean;
  player1Score: number;
  player2Score: number;
  player1Attempts: number;
  player2Attempts: number;
  player1Solved: boolean;
  player2Solved: boolean;
  player1SolvedAt?: string;
  player2SolvedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type QueueStatus = "queued" | "matched";

export type QueueResult = {
  status: QueueStatus;
  match?: Match;
};

export type PublicMatchStats = {
  queuedPlayers: number;
  activeMatchPlayers: number;
  cachedAt: string;
};

export type MatchSubmissionExecutionStatus =
  | "queued"
  | "sent_to_judge"
  | "running"
  | "finished"
  | "failed";

export type MatchSubmissionJudgeStatus =
  | "pending"
  | "queued"
  | "running"
  | "finished"
  | "failed";

export type MatchSubmissionVerdict =
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compile_error"
  | "presentation_error"
  | "system_error";

export type MatchSubmissionTestResult = {
  testCaseId: string;
  status: string;
  timeMs?: number;
  memoryKb?: number;
  exitCode?: number;
  checkerMessage?: string;
};

export type MatchSubmission = {
  id: string;
  matchId?: string;
  taskId: string;
  userId: string;
  language: string;
  languageVersion: string;
  sourceCode: string;
  status: MatchSubmissionExecutionStatus;
  verdict?: MatchSubmissionVerdict;
  judgeSubmissionId?: string;
  judgeStatus?: MatchSubmissionJudgeStatus;
  errorMessage?: string;
  passedTests: number;
  totalTests: number;
  compileTimeMs?: number;
  runTimeMs?: number;
  peakMemoryKb?: number;
  score: number;
  exitCode?: number;
  compileLog?: string;
  stdoutTruncated?: string;
  stderrTruncated?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  updatedAt: string;
  testResults: MatchSubmissionTestResult[];
};

export type ArenaEventName =
  | "connected"
  | "matchmaking.queued"
  | "matchmaking.matched"
  | "match.found"
  | "match.accepted"
  | "match.started"
  | "match.cancelled"
  | "match.progress"
  | "match.finished";

export type ArenaEvent =
  | {
      id: string | null;
      type: "connected";
      data: {
        ok: boolean;
      };
    }
  | {
      id: string | null;
      type: "matchmaking.queued";
      data: QueueResult;
    }
  | {
      id: string | null;
      type:
        | "matchmaking.matched"
        | "match.found"
        | "match.accepted"
        | "match.started"
        | "match.cancelled"
        | "match.progress"
        | "match.finished";
      data: Match;
    };
