import type { ChallengeJudgeStatus, ChallengeVerdict } from "../types";
import { parseJudgeStatus, parseVerdict } from "./enums";

type Parser<T> = (value: unknown) => T | null;

function parseOptionalEnum<T>(value: unknown, parser: Parser<T>): T | undefined | null {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  return parser(normalized) ?? null;
}

export function parseOptionalVerdict(
  value: unknown,
): ChallengeVerdict | undefined | null {
  return parseOptionalEnum(value, parseVerdict);
}

export function parseOptionalJudgeStatus(
  value: unknown,
): ChallengeJudgeStatus | undefined | null {
  return parseOptionalEnum(value, parseJudgeStatus);
}
