import { API_BASE_URL } from "@/shared/config/api";

export class ManagementError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ManagementError";
  }
}

export async function managementRequest(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<unknown> {
  // const debugStartedAt = performance.now();
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
    ...(options.body !== undefined
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options.body),
        }
      : {}),
  });
  const body: unknown = await response.json().catch(() => null);
  // console.debug("[management.http.completed]", {
  //   method: options.method ?? "GET", route: path.split("?")[0],
  //   status: response.status, ok: response.ok,
  //   durationMs: Math.round(performance.now() - debugStartedAt),
  //   requestId: isRecord(body) && isRecord(body.error) ? body.error.requestId : response.headers.get("X-Request-ID"),
  //   errorCode: isRecord(body) && isRecord(body.error) ? body.error.code : undefined,
  // });
  if (!response.ok) {
    let message = "The request could not be completed. Please try again.";
    let code: string | undefined;
    let requestId = response.headers.get("X-Request-ID") ?? undefined;
    if (isRecord(body)) {
      if (typeof body.error === "string") message = body.error;
      else if (isRecord(body.error)) {
        if (typeof body.error.message === "string") message = body.error.message;
        if (typeof body.error.code === "string") code = body.error.code;
        if (typeof body.error.requestId === "string") requestId = body.error.requestId;
      }
    }
    throw new ManagementError(message, response.status, code, requestId);
  }
  return body;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function managementErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}
