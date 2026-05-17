import { API_BASE_URL } from "@/shared/config/api";
import {
  parseCurrentMatchResponse,
  parseMatchFromSnakeCase,
  parseMatchSubmissionFromSnakeCase,
  parseQueueResultFromSnakeCase,
} from "../model/parsers";
import type { Match, MatchSubmission, QueueResult } from "../model/types";

export type JoinQueueInput = {
  taskMode: "normal" | "hard";
  isRated: boolean;
  ratingMode?: "global";
};

function readErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  if ("error" in body && typeof body.error === "string" && body.error.trim() !== "") {
    return body.error;
  }

  return fallback;
}

async function parseResponseBody(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

async function requestQueueResult(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(input, init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(body, fallbackMessage));
  }

  const queueResult = parseQueueResultFromSnakeCase(body);
  if (!queueResult) {
    throw new Error("Invalid queue response");
  }

  return queueResult;
}

async function requestMatch(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(input, init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(body, fallbackMessage));
  }

  const match = parseMatchFromSnakeCase(body);
  if (!match) {
    throw new Error("Invalid match response");
  }

  return match;
}

async function requestSubmission(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(input, init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(body, fallbackMessage));
  }

  const submission = parseMatchSubmissionFromSnakeCase(body);
  if (!submission) {
    throw new Error("Invalid submission response");
  }

  return submission;
}

export async function joinQueue(input: JoinQueueInput): Promise<QueueResult> {
  return requestQueueResult(
    `${API_BASE_URL}/api/matches/queue`,
    {
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
    "Failed to join matchmaking queue",
  );
}

export async function leaveQueue() {
  const response = await fetch(`${API_BASE_URL}/api/matches/queue`, {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status === 204) {
    return;
  }

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(body, "Failed to leave matchmaking queue"));
  }
}

export async function getCurrentMatch(signal?: AbortSignal): Promise<{
  match: Match | null;
}> {
  const response = await fetch(`${API_BASE_URL}/api/matches/current`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal,
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(body, "Failed to fetch current match"));
  }

  const parsed = parseCurrentMatchResponse(body);
  if (!parsed) {
    throw new Error("Invalid current match response");
  }

  return parsed;
}

export async function getMatch(matchId: string, signal?: AbortSignal): Promise<Match> {
  const normalizedMatchID = matchId.trim();
  if (!normalizedMatchID) {
    throw new Error("Match id is required");
  }

  return requestMatch(
    `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
    "Failed to fetch match",
  );
}

export async function startMatch(matchId: string): Promise<Match> {
  const normalizedMatchID = matchId.trim();
  if (!normalizedMatchID) {
    throw new Error("Match id is required");
  }

  return requestMatch(
    `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}/start`,
    {
      method: "POST",
      credentials: "include",
    },
    "Failed to accept match",
  );
}

export type CreateMatchSubmissionPayload = {
  language: string;
  languageVersion: string;
  sourceCode: string;
};

export async function createMatchSubmission(
  matchId: string,
  payload: CreateMatchSubmissionPayload,
): Promise<MatchSubmission> {
  const normalizedMatchID = matchId.trim();
  if (!normalizedMatchID) {
    throw new Error("Match id is required");
  }

  return requestSubmission(
    `${API_BASE_URL}/api/matches/${encodeURIComponent(normalizedMatchID)}/submissions`,
    {
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
    "Failed to submit match solution",
  );
}
