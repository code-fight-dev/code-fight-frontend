import type { ChallengeKind } from "@/entities/challenge";

export function formatAttempts(attempts: number) {
  if (attempts >= 1000) {
    return `${(attempts / 1000).toFixed(1)}k`;
  }

  return attempts.toString();
}

export function getChallengeLanguageScope(kind: ChallengeKind) {
  return kind === "algorithmic" ? "Any language" : "SQL";
}
