import type {
  MatchReplayTimelineEvent,
  MatchReplayTimelineEventPayload,
} from "@/entities/match";

type ReplayTextChangeEventType = "insert" | "delete" | "replace";
type ReplayMetaEventType = "language_switch" | "cursor" | "selection";

export type ReplayProtocolEventType = ReplayTextChangeEventType | ReplayMetaEventType;

export const REPLAY_PROTOCOL_EVENT_TYPES: ReplayProtocolEventType[] = [
  "insert",
  "delete",
  "replace",
  "language_switch",
  "cursor",
  "selection",
];

export const REPLAY_KEYFRAME_STRATEGY = {
  maxEventsBetweenSnapshots: 100,
  maxMsBetweenSnapshots: 3000,
} as const;

export type ReplayTextChangePayload = {
  rangeOffset: number;
  rangeLength: number;
  text: string;
};

export type ReplayLanguageSwitchPayload = {
  language: string;
};

export type ReplayParsedTimelineEvent =
  | {
      userId: string;
      seq: number;
      tMs: number;
      type: ReplayTextChangeEventType;
      payload: ReplayTextChangePayload;
    }
  | {
      userId: string;
      seq: number;
      tMs: number;
      type: "language_switch";
      payload: ReplayLanguageSwitchPayload;
    };

function readPayloadNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    return null;
  }

  return value;
}

function readPayloadString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseTextChangePayload(
  payload: MatchReplayTimelineEventPayload,
): ReplayTextChangePayload | null {
  const rangeOffset = readPayloadNumber(
    payload.range_offset ?? payload.rangeOffset ?? payload.offset,
  );
  const rangeLength = readPayloadNumber(
    payload.range_length ?? payload.rangeLength ?? payload.length ?? 0,
  );
  const text = readPayloadString(payload.text) ?? "";

  if (rangeOffset === null || rangeLength === null) {
    return null;
  }

  return {
    rangeOffset,
    rangeLength,
    text,
  };
}

function parseLanguageSwitchPayload(
  payload: MatchReplayTimelineEventPayload,
): ReplayLanguageSwitchPayload | null {
  const language = readPayloadString(payload.language)?.trim();
  if (!language) {
    return null;
  }

  return { language };
}

export function parseReplayTimelineEvent(
  event: MatchReplayTimelineEvent,
): ReplayParsedTimelineEvent | null {
  switch (event.type) {
    case "insert":
    case "delete":
    case "replace": {
      const payload = parseTextChangePayload(event.payload);
      if (!payload) {
        return null;
      }

      return {
        userId: event.userId,
        seq: event.seq,
        tMs: event.tMs,
        type: event.type,
        payload,
      };
    }

    case "language_switch": {
      const payload = parseLanguageSwitchPayload(event.payload);
      if (!payload) {
        return null;
      }

      return {
        userId: event.userId,
        seq: event.seq,
        tMs: event.tMs,
        type: "language_switch",
        payload,
      };
    }

    default:
      return null;
  }
}

export function applyReplayTextChange(
  sourceCode: string,
  payload: ReplayTextChangePayload,
): string | null {
  const start = payload.rangeOffset;
  const end = payload.rangeOffset + payload.rangeLength;

  if (start < 0 || start > sourceCode.length) {
    return null;
  }
  if (end < start || end > sourceCode.length) {
    return null;
  }

  return `${sourceCode.slice(0, start)}${payload.text}${sourceCode.slice(end)}`;
}
