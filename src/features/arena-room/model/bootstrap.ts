import {
  DEFAULT_CHALLENGE_LANGUAGE,
  type Challenge,
  type ChallengeLanguage,
} from "@/entities/challenge";
import { getChallengeByTaskId } from "@/entities/challenge/client";
import type { Match } from "@/entities/match";
import { getMatch } from "@/entities/match/client";

type BootstrapArenaRoomResult = {
  match: Match;
  challenge: Challenge;
  initialLanguage: ChallengeLanguage;
  initialCodeByLanguage: Partial<Record<ChallengeLanguage, string>>;
};

function getInitialLanguage(languages: ChallengeLanguage[]) {
  if (languages.includes(DEFAULT_CHALLENGE_LANGUAGE)) {
    return DEFAULT_CHALLENGE_LANGUAGE;
  }

  return languages[0] ?? null;
}

export async function bootstrapArenaRoom(
  matchId: string,
): Promise<BootstrapArenaRoomResult> {
  const normalizedMatchID = matchId.trim();
  if (!normalizedMatchID) {
    throw new Error("Match id is required.");
  }

  const currentMatch = await getMatch(normalizedMatchID);
  if (currentMatch.status !== "running") {
    throw new Error("This match is not running.");
  }

  if (!currentMatch.taskId) {
    throw new Error("Match task is not assigned.");
  }

  const challenge = await getChallengeByTaskId(currentMatch.taskId);
  if (!challenge) {
    throw new Error("Challenge for this match was not found.");
  }

  const initialLanguage = getInitialLanguage(challenge.supportedLanguages);
  if (!initialLanguage) {
    throw new Error("No supported languages for this match challenge.");
  }

  return {
    match: currentMatch,
    challenge,
    initialLanguage,
    initialCodeByLanguage: { ...challenge.starterCodeByLanguage },
  };
}
