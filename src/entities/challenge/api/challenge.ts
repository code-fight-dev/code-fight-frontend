import { API_BASE_URL } from "@/shared/config/api";
import {
  parseChallengeFromTaskPayload,
  readChallengeErrorMessage,
} from "../model/parsers/challenge";

type ChallengeResponseBody = {
  task?: unknown;
  error?: string;
};

export async function getChallengeByTaskId(taskId: string, signal?: AbortSignal) {
  const normalizedTaskID = taskId.trim();
  if (!normalizedTaskID) {
    throw new Error("Task id is required");
  }

  const response = await fetch(
    `${API_BASE_URL}/api/tasks/id/${encodeURIComponent(normalizedTaskID)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
    },
  );

  if (response.status === 404) {
    return null;
  }

  const body = (await response.json().catch(() => null)) as ChallengeResponseBody | null;

  if (!response.ok) {
    throw new Error(readChallengeErrorMessage(body, "Failed to fetch challenge"));
  }

  const challenge = parseChallengeFromTaskPayload(body?.task);
  if (!challenge || challenge.supportedLanguages.length === 0) {
    return null;
  }

  return challenge;
}
