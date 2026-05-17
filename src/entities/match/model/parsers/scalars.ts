export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function readOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function readOptionalNumber(value: unknown) {
  const parsed = parseNumber(value);
  return parsed === null ? undefined : parsed;
}

export function readRequiredNumber(value: unknown) {
  const parsed = parseNumber(value);
  return parsed === null ? null : parsed;
}

export function readOptionalBoolean(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return null;
}
