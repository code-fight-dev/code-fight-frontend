import type { MatchReplay } from "@/entities/match";
import { parseReplayTimelineEvent, type ReplayParsedTimelineEvent } from "../protocol";
import type { ReplaySnapshotPoint } from "./types";

type TimelinePoint = {
  tMs: number;
  seq: number;
};

function compareByTimeline(a: TimelinePoint, b: TimelinePoint) {
  if (a.tMs !== b.tMs) {
    return a.tMs - b.tMs;
  }

  return a.seq - b.seq;
}

export function filterPlayerSnapshots(
  replay: MatchReplay,
  playerId: string,
): ReplaySnapshotPoint[] {
  return replay.timeline.snapshots
    .filter((snapshot) => snapshot.userId === playerId)
    .map((snapshot) => ({
      seq: snapshot.seq,
      tMs: snapshot.tMs,
      language: snapshot.language,
      sourceCode: snapshot.sourceCode,
    }))
    .sort(compareByTimeline);
}

export function filterPlayerEvents(
  replay: MatchReplay,
  playerId: string,
): ReplayParsedTimelineEvent[] {
  const items = replay.timeline.events
    .filter((event) => event.userId === playerId)
    .sort(compareByTimeline);

  const parsedEvents: ReplayParsedTimelineEvent[] = [];
  for (const event of items) {
    const parsed = parseReplayTimelineEvent(event);
    if (!parsed) {
      if (
        event.type === "insert" ||
        event.type === "delete" ||
        event.type === "replace" ||
        event.type === "language_switch"
      ) {
        throw new Error(
          `Replay contains invalid timeline event (seq=${event.seq}, type=${event.type}).`,
        );
      }
      continue;
    }

    parsedEvents.push(parsed);
  }

  return parsedEvents;
}
