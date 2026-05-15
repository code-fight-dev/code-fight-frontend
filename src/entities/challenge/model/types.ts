export type ChallengeDifficulty = "Easy" | "Medium" | "Hard";

export type ChallengeLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "java"
  | "cpp"
  | "go"
  | "rust"
  | "sql";

export type ChallengeKind = "algorithmic" | "sql";

export type ChallengeProgress = "not-started" | "in-progress" | "solved" | "locked";

export type ChallengeExample = {
  title: string;
  input: string;
  output: string;
  explanation?: string;
};

export type ChallengeTestCase = {
  name: string;
  input: string;
  expectedOutput: string;
  locked?: boolean;
};

export type ChallengeExecutionStatus =
  | "queued"
  | "sent_to_judge"
  | "running"
  | "finished"
  | "failed";

export type ChallengeJudgeStatus =
  | "pending"
  | "queued"
  | "running"
  | "finished"
  | "failed";

export type ChallengeVerdict =
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compile_error"
  | "presentation_error"
  | "system_error";

export type TaskSubmissionTestResult = {
  testCaseId: string;
  status: string;
  timeMs?: number;
  memoryKb?: number;
  exitCode?: number;
  checkerMessage?: string;
};

export type TaskSubmission = {
  id: string;
  matchId?: string;
  taskId: string;
  userId: string;
  language: string;
  languageVersion: string;
  sourceCode: string;
  status: ChallengeExecutionStatus;
  verdict?: ChallengeVerdict;
  judgeSubmissionId?: string;
  judgeStatus?: ChallengeJudgeStatus;
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
  testResults: TaskSubmissionTestResult[];
};

export type TaskSubmissionSummary = {
  id: string;
  createdAt: string;
  language: string;
  status: ChallengeExecutionStatus;
  verdict?: ChallengeVerdict;
  passedTests: number;
  totalTests: number;
  runTimeMs?: number;
  errorMessage?: string;
};

export type CodeRunTestResult = {
  testCaseId?: string;
  testName?: string;
  isCustom: boolean;
  status: string;
  timeMs?: number;
  memoryKb?: number;
  exitCode?: number;
  checkerMessage?: string;
};

export type CodeRun = {
  id: string;
  taskId: string;
  userId: string;
  language: string;
  languageVersion: string;
  status: ChallengeExecutionStatus;
  verdict?: ChallengeVerdict;
  judgeSubmissionId?: string;
  judgeStatus?: ChallengeJudgeStatus;
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
  testResults: CodeRunTestResult[];
};

export type Challenge = {
  id: string;
  taskId: string;
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  summary: string;
  description: string[];
  examples: ChallengeExample[];
  constraints: string[];
  notes?: string[];
  tags: string[];
  category: string;
  kind: ChallengeKind;
  supportedLanguages: ChallengeLanguage[];
  languageVersions: Partial<Record<ChallengeLanguage, string>>;
  starterCodeByLanguage: Partial<Record<ChallengeLanguage, string>>;
  acceptanceRate: number;
  estimatedMinutes: number;
  attempts: number;
  popularity: number;
  createdAt: string;
  progress: ChallengeProgress;
  testCases: ChallengeTestCase[];
  submissionHistory: TaskSubmissionSummary[];
};

export type ChallengeListItem = Pick<
  Challenge,
  | "id"
  | "slug"
  | "title"
  | "difficulty"
  | "summary"
  | "tags"
  | "category"
  | "kind"
  | "supportedLanguages"
  | "acceptanceRate"
  | "estimatedMinutes"
  | "attempts"
  | "popularity"
  | "createdAt"
  | "progress"
>;

export type ChallengeTopicCount = {
  name: string;
  count: number;
};

export type ChallengeLanguageMeta = {
  id: ChallengeLanguage;
  label: string;
  monacoLanguage: string;
  extension: string;
};
