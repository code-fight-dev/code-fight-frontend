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

export type Challenge = {
  id: string;
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
  starterCodeByLanguage: Partial<Record<ChallengeLanguage, string>>;
  acceptanceRate: number;
  estimatedMinutes: number;
  attempts: number;
  popularity: number;
  createdAt: string;
  progress: ChallengeProgress;
  testCases: ChallengeTestCase[];
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
