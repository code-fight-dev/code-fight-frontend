export const REQUEST_TIMEOUT_MS = 15_000;

export class RequestTimeoutError extends Error {
  constructor() {
    super("The request timed out. Please try again.");
    this.name = "RequestTimeoutError";
  }
}

export async function withRequestDeadline<T>(
  request: (signal: AbortSignal) => Promise<T>,
  callerSignal?: AbortSignal,
): Promise<T> {
  callerSignal?.throwIfAborted();
  const controller = new AbortController();
  const forwardAbort = () => controller.abort(callerSignal?.reason);
  let rejectAbort = () => {};
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", rejectAbort, { once: true });
  });
  callerSignal?.addEventListener("abort", forwardAbort, { once: true });
  const timeout = setTimeout(
    () => controller.abort(new RequestTimeoutError()),
    REQUEST_TIMEOUT_MS,
  );
  try {
    return await Promise.race([request(controller.signal), aborted]);
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", forwardAbort);
    controller.signal.removeEventListener("abort", rejectAbort);
  }
}
