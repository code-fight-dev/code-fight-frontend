import { API_BASE_URL } from "@/shared/config/api";
import {
  parseCurrentMatchResponse,
  parseMatchFromSnakeCase,
  parseMatchReplayFromSnakeCase,
  parseMatchSubmissionFromSnakeCase,
  parseQueueResultFromSnakeCase,
} from "../model/parsers";
import type { Match, MatchReplay, MatchSubmission, QueueResult } from "../model/types";
import { requestNoContent, requestParsed } from "./lib/http";
import { requireNormalizedId } from "./lib/params";

export type JoinQueueInput = {
  taskMode: "normal" | "hard";
  isRated: boolean;
  ratingMode?: "global";
};

export type CreateMatchSubmissionPayload = {
  language: string;
  languageVersion: string;
  sourceCode: string;
};

export async function joinQueue(input: JoinQueueInput): Promise<QueueResult> {
  return requestParsed({
    input: `${API_BASE_URL}/api/matches/queue`,
    init: {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating_mode: input.ratingMode ?? "global",
        task_mode: input.taskMode,
        is_rated: input.isRated,
      }),
    },
    fallbackMessage: "Failed to join matchmaking queue",
    parser: parseQueueResultFromSnakeCase,
    invalidMessage: "Invalid queue response",
  });
}

export async function leaveQueue() {
  return requestNoContent({
    input: `${API_BASE_URL}/api/matches/queue`,
    init: {
      method: "DELETE",
      credentials: "include",
    },
    fallbackMessage: "Failed to leave matchmaking queue",
  });
}

export async function getCurrentMatch(signal?: AbortSignal): Promise<{
  match: Match | null;
}> {
  return requestParsed({
    input: `${API_BASE_URL}/api/matches/current`,
    init: {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
    fallbackMessage: "Failed to fetch current match",
    parser: parseCurrentMatchResponse,
    invalidMessage: "Invalid current match response",
  });
}

export async function getMatch(matchId: string, signal?: AbortSignal): Promise<Match> {
  const normalizedMatchID = requireNormalizedId(matchId, "Match id");

  return requestParsed({
    input: `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}`,
    init: {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
    fallbackMessage: "Failed to fetch match",
    parser: parseMatchFromSnakeCase,
    invalidMessage: "Invalid match response",
  });
}

export async function startMatch(matchId: string): Promise<Match> {
  const normalizedMatchID = requireNormalizedId(matchId, "Match id");

  return requestParsed({
    input: `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}/start`,
    init: {
      method: "POST",
      credentials: "include",
    },
    fallbackMessage: "Failed to accept match",
    parser: parseMatchFromSnakeCase,
    invalidMessage: "Invalid match response",
  });
}

export async function surrenderMatch(matchId: string): Promise<void> {
  const normalizedMatchID = requireNormalizedId(matchId, "Match id");

  return requestNoContent({
    input: `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}/surrender`,
    init: {
      method: "POST",
      credentials: "include",
    },
    fallbackMessage: "Failed to surrender match",
  });
}

export async function createMatchSubmission(
  matchId: string,
  payload: CreateMatchSubmissionPayload,
): Promise<MatchSubmission> {
  const normalizedMatchID = requireNormalizedId(matchId, "Match id");

  return requestParsed({
    input: `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}/submissions`,
    init: {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: payload.language,
        language_version: payload.languageVersion,
        source_code: payload.sourceCode,
      }),
    },
    fallbackMessage: "Failed to submit match solution",
    parser: parseMatchSubmissionFromSnakeCase,
    invalidMessage: "Invalid submission response",
  });
}

export async function getMatchReplay(
  matchId: string,
  signal?: AbortSignal,
): Promise<MatchReplay> {
  const normalizedMatchID = requireNormalizedId(matchId, "Match id");

  return requestParsed({
    input: `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}/replay`,
    init: {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
    fallbackMessage: "Failed to fetch match replay",
    parser: parseMatchReplayFromSnakeCase,
    invalidMessage: "Invalid match replay response",
  });
}
