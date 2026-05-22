type Parser<T> = (value: unknown) => T | null;

type RequestParsedParams<T> = {
  input: RequestInfo | URL;
  init: RequestInit;
  fallbackMessage: string;
  parser: Parser<T>;
  invalidMessage: string;
};

type RequestNoContentParams = {
  input: RequestInfo | URL;
  init: RequestInit;
  fallbackMessage: string;
  successStatus?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function readErrorMessage(body: unknown, fallback: string) {
  if (!isRecord(body)) {
    return fallback;
  }

  if (typeof body.error === "string" && body.error.trim() !== "") {
    return body.error;
  }

  return fallback;
}

export async function parseResponseBody(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

export async function requestParsed<T>({
  input,
  init,
  fallbackMessage,
  parser,
  invalidMessage,
}: RequestParsedParams<T>): Promise<T> {
  const response = await fetch(input, init);
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(readErrorMessage(body, fallbackMessage));
  }

  const parsed = parser(body);
  if (!parsed) {
    throw new Error(invalidMessage);
  }

  return parsed;
}

export async function requestNoContent({
  input,
  init,
  fallbackMessage,
  successStatus = 204,
}: RequestNoContentParams) {
  const response = await fetch(input, init);
  if (response.status === successStatus) {
    return;
  }

  const body = await parseResponseBody(response);
  if (!response.ok) {
    throw new Error(readErrorMessage(body, fallbackMessage));
  }

  throw new Error(
    `${fallbackMessage}: unexpected response status ${response.status}, expected ${successStatus}`,
  );
}
