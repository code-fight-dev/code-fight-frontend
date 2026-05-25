import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { subscribeArenaEvents } from "@/entities/match/client";

type Listener = (event: Event) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  readonly addEventListener = vi.fn((name: string, listener: Listener) => {
    const listeners = this.listeners.get(name) ?? new Set<Listener>();
    listeners.add(listener);
    this.listeners.set(name, listeners);
  });

  readonly removeEventListener = vi.fn((name: string, listener: Listener) => {
    const listeners = this.listeners.get(name);
    listeners?.delete(listener);
  });

  readonly close = vi.fn();

  private readonly listeners = new Map<string, Set<Listener>>();

  constructor(
    public readonly url: string,
    public readonly init: {
      withCredentials: boolean;
    },
  ) {
    MockEventSource.instances.push(this);
  }

  emit(name: string, data: string, lastEventId = "") {
    const event = {
      data,
      lastEventId,
    } as unknown as MessageEvent<string>;

    const listeners = this.listeners.get(name);
    for (const listener of listeners ?? []) {
      listener(event as unknown as Event);
    }
  }
}

describe("match events api", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    Object.defineProperty(globalThis, "EventSource", {
      writable: true,
      value: MockEventSource as unknown as typeof EventSource,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("subscribes to arena events, parses events and calls callbacks", () => {
    const onEvent = vi.fn();
    const onOpen = vi.fn();
    const onError = vi.fn();

    const unsubscribe = subscribeArenaEvents({
      onEvent,
      onOpen,
      onError,
    });

    const source = MockEventSource.instances[0];
    expect(source?.url).toContain("/api/events");
    expect(source?.init).toEqual({
      withCredentials: true,
    });

    source.emit("open", "");
    source.emit("error", "");
    source.emit("connected", JSON.stringify({ ok: true }), "event-1");

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({
      id: "event-1",
      type: "connected",
      data: {
        ok: true,
      },
    });

    unsubscribe();
    expect(source.close).toHaveBeenCalledTimes(1);
    expect(source.removeEventListener).toHaveBeenCalled();
  });

  it("ignores unparsable events and maps empty event id to null", () => {
    const onEvent = vi.fn();

    const unsubscribe = subscribeArenaEvents({
      onEvent,
    });
    const source = MockEventSource.instances[0];

    source.emit("connected", "{bad-json");
    source.emit("connected", JSON.stringify({ ok: true }));
    source.emit("match.started", "{bad-json");

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith({
      id: null,
      type: "connected",
      data: {
        ok: true,
      },
    });

    unsubscribe();
    source.emit("connected", JSON.stringify({ ok: true }), "after-close");
    expect(onEvent).toHaveBeenCalledTimes(1);
  });
});
