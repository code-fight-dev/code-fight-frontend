import {
  joinQueue,
  leaveQueue,
  startMatch,
  type JoinQueueInput,
} from "@/entities/match/client";
import type { Match, QueueResult } from "@/entities/match";

export async function joinMatchmakingQueue(input: JoinQueueInput): Promise<QueueResult> {
  return joinQueue(input);
}

export async function cancelMatchmakingQueue() {
  await leaveQueue();
}

export async function acceptMatchmakingMatch(matchId: string): Promise<Match> {
  return startMatch(matchId);
}
