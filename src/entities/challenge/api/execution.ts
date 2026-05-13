import { API_BASE_URL } from "@/shared/config/api";
import {
  parseCodeRunFromSnakeCase,
  parseTaskSubmissionFromSnakeCase,
} from "../model/parsers/execution";
import { isRecord } from "../model/parsers/scalars";
import type { ChallengeLanguage, CodeRun, TaskSubmission } from "../model/types";

type BaseExecutionPayload = {
  language: ChallengeLanguage;
  languageVersion: string;
  sourceCode: string;
};

export type CreateTaskSubmissionPayload = BaseExecutionPayload;

export type CreateTaskRunPayload = BaseExecutionPayload & {
  customTestInput?: string;
};

function getErrorMessage(body: unknown, fallback: string) {
  if (!isRecord(body)) {
    return fallback;
  }

  if (typeof body.error === "string" && body.error.trim() !== "") {
    return body.error;
  }

  return fallback;
}

async function parseResponseBody(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

async function requestTaskSubmission(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(input, init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, fallbackMessage));
  }

  const submission = parseTaskSubmissionFromSnakeCase(body);
  if (!submission) {
    throw new Error("Invalid submission response");
  }

  return submission;
}

async function requestCodeRun(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(input, init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(body, fallbackMessage));
  }

  const codeRun = parseCodeRunFromSnakeCase(body);
  if (!codeRun) {
    throw new Error("Invalid code run response");
  }

  return codeRun;
}

export async function createTaskSubmission(
  taskId: string,
  payload: CreateTaskSubmissionPayload,
  signal?: AbortSignal,
): Promise<TaskSubmission> {
  const normalizedTaskID = taskId.trim();
  if (!normalizedTaskID) {
    throw new Error("Task id is required");
  }

  return requestTaskSubmission(
    `${API_BASE_URL}/api/tasks/${encodeURIComponent(normalizedTaskID)}/submissions`,
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
      signal,
    },
    "Failed to submit solution",
  );
}

export async function getSubmission(
  submissionId: string,
  signal?: AbortSignal,
): Promise<TaskSubmission> {
  const normalizedSubmissionID = submissionId.trim();
  if (!normalizedSubmissionID) {
    throw new Error("Submission id is required");
  }

  return requestTaskSubmission(
    `${API_BASE_URL}/api/submissions/${encodeURIComponent(normalizedSubmissionID)}`,
    {
      method: "GET",
      credentials: "include",
      signal,
    },
    "Failed to fetch submission",
  );
}

export async function createTaskRun(
  taskId: string,
  payload: CreateTaskRunPayload,
  signal?: AbortSignal,
): Promise<CodeRun> {
  const normalizedTaskID = taskId.trim();
  if (!normalizedTaskID) {
    throw new Error("Task id is required");
  }

  const customInput = payload.customTestInput;
  const hasCustomInput = typeof customInput === "string" && customInput.trim() !== "";

  return requestCodeRun(
    `${API_BASE_URL}/api/tasks/${encodeURIComponent(normalizedTaskID)}/runs`,
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
        ...(hasCustomInput
          ? {
              custom_test: {
                input: customInput,
              },
            }
          : {}),
      }),
      signal,
    },
    "Failed to run code",
  );
}

export async function getCodeRun(
  codeRunId: string,
  signal?: AbortSignal,
): Promise<CodeRun> {
  const normalizedCodeRunID = codeRunId.trim();
  if (!normalizedCodeRunID) {
    throw new Error("Code run id is required");
  }

  return requestCodeRun(
    `${API_BASE_URL}/api/code-runs/${encodeURIComponent(normalizedCodeRunID)}`,
    {
      method: "GET",
      credentials: "include",
      signal,
    },
    "Failed to fetch code run",
  );
}
