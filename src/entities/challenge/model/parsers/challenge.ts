import { PROGRAMMING_LANGUAGE_BY_ID } from "../languages";
import type {
  Challenge,
  ChallengeDifficulty,
  ChallengeExample,
  ChallengeKind,
  ChallengeLanguage,
  ChallengeProgress,
  ChallengeTestCase,
  TaskSubmissionSummary,
} from "../types";
import { parseTaskSubmissionSummaryFromCamelCase } from "./submission";
import { isRecord, readNumber, readString, readStringArray } from "./scalars";

const CHALLENGE_LANGUAGE_IDS = new Set<ChallengeLanguage>(
  Object.keys(PROGRAMMING_LANGUAGE_BY_ID) as ChallengeLanguage[],
);

function parseDifficulty(value: unknown): ChallengeDifficulty {
  const normalized = readString(value).trim().toLowerCase();

  if (normalized === "easy") {
    return "Easy";
  }

  if (normalized === "hard") {
    return "Hard";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  return "Medium";
}

function parseKind(value: unknown): ChallengeKind {
  return readString(value).trim().toLowerCase() === "sql" ? "sql" : "algorithmic";
}

function parseProgress(value: unknown): ChallengeProgress {
  const normalized = readString(value).trim().toLowerCase().replaceAll("_", "-");

  if (normalized === "in-progress" || normalized === "inprogress") {
    return "in-progress";
  }

  if (
    normalized === "solved" ||
    normalized === "completed" ||
    normalized === "accepted"
  ) {
    return "solved";
  }

  if (normalized === "locked") {
    return "locked";
  }

  return "not-started";
}

function parseSupportedLanguages(value: unknown): ChallengeLanguage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set<ChallengeLanguage>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.trim().toLowerCase() as ChallengeLanguage;
    if (CHALLENGE_LANGUAGE_IDS.has(normalized)) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}

function parseStarterCodeByLanguage(
  value: unknown,
  supportedLanguages: ChallengeLanguage[],
): Partial<Record<ChallengeLanguage, string>> {
  if (!isRecord(value)) {
    return {};
  }

  const starterCodeByLanguage: Partial<Record<ChallengeLanguage, string>> = {};

  for (const language of supportedLanguages) {
    const sourceCode = value[language];
    if (typeof sourceCode === "string") {
      starterCodeByLanguage[language] = sourceCode;
    }
  }

  return starterCodeByLanguage;
}

function parseLanguageVersions(
  value: unknown,
): Partial<Record<ChallengeLanguage, string>> {
  if (!isRecord(value)) {
    return {};
  }

  const languageVersions: Partial<Record<ChallengeLanguage, string>> = {};

  for (const [key, rawVersion] of Object.entries(value)) {
    const normalizedLanguage = key.trim().toLowerCase() as ChallengeLanguage;

    if (!CHALLENGE_LANGUAGE_IDS.has(normalizedLanguage)) {
      continue;
    }

    if (typeof rawVersion === "string" && rawVersion.trim() !== "") {
      languageVersions[normalizedLanguage] = rawVersion;
    }
  }

  return languageVersions;
}

function parseChallengeExample(value: unknown): ChallengeExample | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = readString(value.title).trim();
  if (!title || typeof value.input !== "string" || typeof value.output !== "string") {
    return null;
  }

  const explanation = readString(value.explanation).trim();

  return {
    title,
    input: value.input,
    output: value.output,
    ...(explanation ? { explanation } : {}),
  };
}

function parseChallengeTestCase(value: unknown): ChallengeTestCase | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = readString(value.name).trim();
  if (
    !name ||
    typeof value.input !== "string" ||
    typeof value.expectedOutput !== "string"
  ) {
    return null;
  }

  const locked = typeof value.locked === "boolean" ? value.locked : undefined;

  return {
    name,
    input: value.input,
    expectedOutput: value.expectedOutput,
    ...(typeof locked === "boolean" ? { locked } : {}),
  };
}

export function parseChallengeFromTaskPayload(value: unknown): Challenge | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id).trim();
  const slug = readString(value.slug).trim();
  const title = readString(value.title).trim();

  if (!id || !slug || !title) {
    return null;
  }

  const supportedLanguages = parseSupportedLanguages(value.supportedLanguages);
  const taskId = readString(value.taskId, id).trim();
  const notes = readStringArray(value.notes);
  const languageVersions = parseLanguageVersions(value.languageVersions);
  const examples = Array.isArray(value.examples)
    ? value.examples
        .map(parseChallengeExample)
        .filter((example): example is ChallengeExample => example !== null)
    : [];
  const testCases = Array.isArray(value.testCases)
    ? value.testCases
        .map(parseChallengeTestCase)
        .filter((testCase): testCase is ChallengeTestCase => testCase !== null)
    : [];
  const submissionHistory = Array.isArray(value.submissionHistory)
    ? value.submissionHistory
        .map(parseTaskSubmissionSummaryFromCamelCase)
        .filter((submission): submission is TaskSubmissionSummary => submission !== null)
    : [];

  return {
    id,
    taskId,
    slug,
    title,
    difficulty: parseDifficulty(value.difficulty),
    summary: readString(value.summary),
    description: readStringArray(value.description),
    examples,
    constraints: readStringArray(value.constraints),
    ...(notes.length > 0 ? { notes } : {}),
    tags: readStringArray(value.tags),
    category: readString(value.category),
    kind: parseKind(value.kind),
    supportedLanguages,
    languageVersions,
    starterCodeByLanguage: parseStarterCodeByLanguage(
      value.starterCodeByLanguage,
      supportedLanguages,
    ),
    acceptanceRate: readNumber(value.acceptanceRate),
    estimatedMinutes: readNumber(value.estimatedMinutes),
    attempts: readNumber(value.attempts),
    popularity: readNumber(value.popularity),
    createdAt: readString(value.createdAt),
    progress: parseProgress(value.progress),
    testCases,
    submissionHistory,
  };
}

export function readChallengeErrorMessage(body: unknown, fallback: string) {
  if (!isRecord(body)) {
    return fallback;
  }

  if (typeof body.error === "string" && body.error.trim() !== "") {
    return body.error;
  }

  return fallback;
}
