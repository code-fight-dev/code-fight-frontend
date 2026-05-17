import { API_BASE_URL } from "@/shared/config/api";
import { parseArenaEvent } from "../model/parsers";
import type { ArenaEvent } from "../model/types";

type SubscribeArenaEventsInput = {
  onEvent: (event: ArenaEvent) => void;
  onOpen?: () => void;
  onError?: () => void;
};

export function subscribeArenaEvents({
  onEvent,
  onOpen,
  onError,
}: SubscribeArenaEventsInput) {
  const eventSource = new EventSource(`${API_BASE_URL}/api/events`, {
    withCredentials: true,
  });

  const eventNames = [
    "connected",
    "matchmaking.queued",
    "matchmaking.matched",
    "match.found",
    "match.accepted",
    "match.started",
    "match.cancelled",
    "match.progress",
    "match.finished",
  ] as const;

  const listeners = eventNames.map((eventName) => {
    const listener = (rawEvent: Event) => {
      const messageEvent = rawEvent as MessageEvent<string>;
      const parsedEvent = parseArenaEvent({
        id:
          typeof messageEvent.lastEventId === "string" && messageEvent.lastEventId !== ""
            ? messageEvent.lastEventId
            : null,
        type: eventName,
        rawData: messageEvent.data,
      });

      if (parsedEvent) {
        onEvent(parsedEvent);
      }
    };

    eventSource.addEventListener(eventName, listener);
    return {
      eventName,
      listener,
    };
  });

  const handleOpen = () => {
    onOpen?.();
  };

  const handleError = () => {
    onError?.();
  };

  eventSource.addEventListener("open", handleOpen);
  eventSource.addEventListener("error", handleError);

  return () => {
    eventSource.removeEventListener("open", handleOpen);
    eventSource.removeEventListener("error", handleError);

    for (const { eventName, listener } of listeners) {
      eventSource.removeEventListener(eventName, listener);
    }

    eventSource.close();
  };
}
