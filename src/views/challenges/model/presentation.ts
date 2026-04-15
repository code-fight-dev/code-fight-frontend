import type { ChallengeDifficulty, ChallengeKind } from "@/entities/challenge";

export function formatAttempts(attempts: number) {
  if (attempts >= 1000) {
    return `${(attempts / 1000).toFixed(1)}k`;
  }

  return attempts.toString();
}

export function getDifficultyClassName(difficulty: ChallengeDifficulty) {
  const styles: Record<ChallengeDifficulty, string> = {
    Easy: "challenge-difficulty-easy",
    Medium: "challenge-difficulty-medium",
    Hard: "challenge-difficulty-hard",
  };

  return styles[difficulty];
}

export function getChallengeLanguageScope(kind: ChallengeKind) {
  return kind === "algorithmic" ? "Any language" : "SQL";
}
