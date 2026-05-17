import type { ArenaEvent, ArenaEventName } from "../types";
import { parseMatchFromSnakeCase, parseQueueResultFromSnakeCase } from "./match";
import { isRecord } from "./scalars";

const ARENA_EVENT_NAMES = new Set<ArenaEventName>([
  "connected",
  "matchmaking.queued",
  "matchmaking.matched",
  "match.found",
  "match.accepted",
  "match.started",
  "match.cancelled",
  "match.progress",
  "match.finished",
]);

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function isArenaEventName(value: string): value is ArenaEventName {
  return ARENA_EVENT_NAMES.has(value as ArenaEventName);
}

export function parseArenaEvent(params: {
  id: string | null;
  type: string;
  rawData: string;
}): ArenaEvent | null {
  if (!isArenaEventName(params.type)) {
    return null;
  }

  const payload = parseJson(params.rawData);

  switch (params.type) {
    case "connected": {
      if (!isRecord(payload) || typeof payload.ok !== "boolean") {
        return null;
      }

      return {
        id: params.id,
        type: params.type,
        data: {
          ok: payload.ok,
        },
      };
    }

    case "matchmaking.queued": {
      const queueResult = parseQueueResultFromSnakeCase(payload);
      if (!queueResult) {
        return null;
      }

      return {
        id: params.id,
        type: params.type,
        data: queueResult,
      };
    }

    default: {
      const match = parseMatchFromSnakeCase(payload);
      if (!match) {
        return null;
      }

      return {
        id: params.id,
        type: params.type,
        data: match,
      };
    }
  }
}
