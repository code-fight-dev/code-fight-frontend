import type { ChallengeDifficulty } from "./types";

const DIFFICULTY_CLASS_NAME: Record<ChallengeDifficulty, string> = {
  Easy: "challenge-difficulty-easy",
  Medium: "challenge-difficulty-medium",
  Hard: "challenge-difficulty-hard",
};

export function getDifficultyClassName(difficulty: ChallengeDifficulty) {
  return DIFFICULTY_CLASS_NAME[difficulty];
}

export function parseChallengeDifficulty(
  value: string | null | undefined,
): ChallengeDifficulty | null {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "easy") {
    return "Easy";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  if (normalized === "hard") {
    return "Hard";
  }

  return null;
}
