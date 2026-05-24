import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isArenaEventName,
  parseArenaEvent,
  parseMatchFromSnakeCase,
  parseQueueResultFromSnakeCase,
} from "@/entities/match";

vi.mock("@/entities/match/model/parsers/match", () => ({
  parseMatchFromSnakeCase: vi.fn(),
  parseQueueResultFromSnakeCase: vi.fn(),
}));

describe("isArenaEventName", () => {
  it("returns true for supported arena event names", () => {
    expect(isArenaEventName("connected")).toBe(true);
    expect(isArenaEventName("matchmaking.queued")).toBe(true);
    expect(isArenaEventName("matchmaking.matched")).toBe(true);
    expect(isArenaEventName("match.found")).toBe(true);
    expect(isArenaEventName("match.accepted")).toBe(true);
    expect(isArenaEventName("match.started")).toBe(true);
    expect(isArenaEventName("match.cancelled")).toBe(true);
    expect(isArenaEventName("match.progress")).toBe(true);
    expect(isArenaEventName("match.finished")).toBe(true);
  });

  it("returns false for unsupported event names", () => {
    expect(isArenaEventName("")).toBe(false);
    expect(isArenaEventName("unknown")).toBe(false);
    expect(isArenaEventName("match.unknown")).toBe(false);
    expect(isArenaEventName("matchmaking.cancelled")).toBe(false);
  });
});

describe("parseArenaEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for unsupported event type", () => {
    const result = parseArenaEvent({
      id: "event-1",
      type: "unknown",
      rawData: JSON.stringify({ ok: true }),
    });

    expect(result).toBeNull();
    expect(parseQueueResultFromSnakeCase).not.toHaveBeenCalled();
    expect(parseMatchFromSnakeCase).not.toHaveBeenCalled();
  });

  it("parses connected event", () => {
    const result = parseArenaEvent({
      id: "event-1",
      type: "connected",
      rawData: JSON.stringify({ ok: true }),
    });

    expect(result).toStrictEqual({
      id: "event-1",
      type: "connected",
      data: {
        ok: true,
      },
    });
  });

  it("keeps nullable event id", () => {
    const result = parseArenaEvent({
      id: null,
      type: "connected",
      rawData: JSON.stringify({ ok: false }),
    });

    expect(result).toStrictEqual({
      id: null,
      type: "connected",
      data: {
        ok: false,
      },
    });
  });

  it("returns null for connected event when payload is not valid JSON", () => {
    const result = parseArenaEvent({
      id: "event-1",
      type: "connected",
      rawData: "{invalid-json",
    });

    expect(result).toBeNull();
  });

  it("returns null for connected event when payload is not an object", () => {
    expect(
      parseArenaEvent({
        id: "event-1",
        type: "connected",
        rawData: "null",
      }),
    ).toBeNull();

    expect(
      parseArenaEvent({
        id: "event-1",
        type: "connected",
        rawData: JSON.stringify(true),
      }),
    ).toBeNull();
  });

  it("returns null for connected event when ok is missing or not boolean", () => {
    expect(
      parseArenaEvent({
        id: "event-1",
        type: "connected",
        rawData: JSON.stringify({}),
      }),
    ).toBeNull();

    expect(
      parseArenaEvent({
        id: "event-1",
        type: "connected",
        rawData: JSON.stringify({ ok: "true" }),
      }),
    ).toBeNull();

    expect(
      parseArenaEvent({
        id: "event-1",
        type: "connected",
        rawData: JSON.stringify({ ok: 1 }),
      }),
    ).toBeNull();
  });

  it("parses matchmaking queued event using queue result parser", () => {
    const queueResult = {
      queueId: "queue-1",
      status: "queued",
    } as unknown as NonNullable<ReturnType<typeof parseQueueResultFromSnakeCase>>;

    vi.mocked(parseQueueResultFromSnakeCase).mockReturnValue(queueResult);

    const payload = {
      queue_id: "queue-1",
      status: "queued",
    };

    const result = parseArenaEvent({
      id: "event-1",
      type: "matchmaking.queued",
      rawData: JSON.stringify(payload),
    });

    expect(parseQueueResultFromSnakeCase).toHaveBeenCalledTimes(1);
    expect(parseQueueResultFromSnakeCase).toHaveBeenCalledWith(payload);

    expect(result).toStrictEqual({
      id: "event-1",
      type: "matchmaking.queued",
      data: queueResult,
    });
  });

  it("returns null for matchmaking queued event when queue result parser fails", () => {
    vi.mocked(parseQueueResultFromSnakeCase).mockReturnValue(null);

    const result = parseArenaEvent({
      id: "event-1",
      type: "matchmaking.queued",
      rawData: JSON.stringify({ queue_id: "queue-1" }),
    });

    expect(result).toBeNull();
  });

  it.each([
    "matchmaking.matched",
    "match.found",
    "match.accepted",
    "match.started",
    "match.cancelled",
    "match.progress",
    "match.finished",
  ])("parses %s event using match parser", (type) => {
    const match = {
      id: "match-1",
      status: "started",
    } as unknown as NonNullable<ReturnType<typeof parseMatchFromSnakeCase>>;

    vi.mocked(parseMatchFromSnakeCase).mockReturnValue(match);

    const payload = {
      id: "match-1",
      status: "started",
    };

    const result = parseArenaEvent({
      id: "event-1",
      type,
      rawData: JSON.stringify(payload),
    });

    expect(parseMatchFromSnakeCase).toHaveBeenCalledTimes(1);
    expect(parseMatchFromSnakeCase).toHaveBeenCalledWith(payload);

    expect(result).toStrictEqual({
      id: "event-1",
      type,
      data: match,
    });
  });

  it("returns null for match events when match parser fails", () => {
    vi.mocked(parseMatchFromSnakeCase).mockReturnValue(null);

    const result = parseArenaEvent({
      id: "event-1",
      type: "match.started",
      rawData: JSON.stringify({ id: "match-1" }),
    });

    expect(result).toBeNull();
  });

  it("passes null payload to match parser when raw data is invalid JSON", () => {
    vi.mocked(parseMatchFromSnakeCase).mockReturnValue(null);

    const result = parseArenaEvent({
      id: "event-1",
      type: "match.started",
      rawData: "{invalid-json",
    });

    expect(parseMatchFromSnakeCase).toHaveBeenCalledTimes(1);
    expect(parseMatchFromSnakeCase).toHaveBeenCalledWith(null);
    expect(result).toBeNull();
  });
});
