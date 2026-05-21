export type LeaderboardSearchParams = {
  mode?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  limit?: string | string[];
  offset?: string | string[];
};

export type LeaderboardViewQuery = {
  mode?: string;
  page?: number;
  pageSize?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function readSearchParam(
  params: Record<string, unknown>,
  key: keyof LeaderboardSearchParams,
): string | string[] | undefined {
  const value = params[key];
  if (typeof value === "string" || isStringArray(value)) {
    return value;
  }

  return undefined;
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function readPositiveInt(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function readNonNegativeInt(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function parseLeaderboardViewQuery(rawParams: unknown): LeaderboardViewQuery {
  const params: LeaderboardSearchParams = isRecord(rawParams)
    ? {
        mode: readSearchParam(rawParams, "mode"),
        page: readSearchParam(rawParams, "page"),
        pageSize: readSearchParam(rawParams, "pageSize"),
        limit: readSearchParam(rawParams, "limit"),
        offset: readSearchParam(rawParams, "offset"),
      }
    : {};

  const mode = firstQueryValue(params.mode)?.trim() || undefined;

  const pageValue = readPositiveInt(firstQueryValue(params.page));
  const pageSizeValueFromPage = readPositiveInt(firstQueryValue(params.pageSize));
  const pageSizeValueFromLimit = readPositiveInt(firstQueryValue(params.limit));
  const offsetValue = readNonNegativeInt(firstQueryValue(params.offset));

  const resolvedPageSize = pageSizeValueFromPage ?? pageSizeValueFromLimit ?? undefined;

  let resolvedPage = pageValue ?? undefined;
  if (!resolvedPage && resolvedPageSize && offsetValue !== null) {
    resolvedPage = Math.floor(offsetValue / resolvedPageSize) + 1;
  }

  return {
    mode,
    page: resolvedPage,
    pageSize: resolvedPageSize,
  };
}
