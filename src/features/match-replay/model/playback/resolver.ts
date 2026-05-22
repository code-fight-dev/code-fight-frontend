import { applyReplayTextChange, type ReplayParsedTimelineEvent } from "../protocol";
import type { MatchReplayCheckpoint, ReplayViewState } from "../types";
import type { ReplaySnapshotPoint, ReplayTrack } from "./types";

function findSnapshotIndexByTime(snapshots: ReplaySnapshotPoint[], targetTimeMs: number) {
  if (snapshots.length === 0) {
    return -1;
  }

  let left = 0;
  let right = snapshots.length - 1;
  let best = -1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const snapshot = snapshots[middle];

    if (snapshot.tMs <= targetTimeMs) {
      best = middle;
      left = middle + 1;
      continue;
    }

    right = middle - 1;
  }

  return best;
}

function findFirstEventIndexAfterTimelinePoint(
  events: ReplayParsedTimelineEvent[],
  tMs: number,
  seq: number,
) {
  let left = 0;
  let right = events.length;

  while (left < right) {
    const middle = Math.floor((left + right) / 2);

    const event = events[middle];
    const isBeforeOrAtPoint = event.tMs < tMs || (event.tMs === tMs && event.seq <= seq);

    if (isBeforeOrAtPoint) {
      left = middle + 1;
    } else {
      right = middle;
    }
  }

  return left;
}

function resolveCurrentCheckpointIndex(
  checkpoints: MatchReplayCheckpoint[],
  tMs: number,
) {
  if (checkpoints.length === 0) {
    return -1;
  }

  let left = 0;
  let right = checkpoints.length - 1;
  let best = 0;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const checkpoint = checkpoints[middle];

    if (checkpoint.tMs <= tMs) {
      best = middle;
      left = middle + 1;
      continue;
    }

    right = middle - 1;
  }

  return best;
}

export function resolveViewStateAtTime(
  track: ReplayTrack,
  targetTimeMs: number,
): ReplayViewState {
  const clampedTimeMs = Math.min(Math.max(targetTimeMs, 0), track.durationMs);
  const snapshotIndex = findSnapshotIndexByTime(track.snapshots, clampedTimeMs);

  let language = track.initialLanguage;
  let sourceCode = track.initialSourceCode;
  let eventStartTMs = -1;
  let eventStartSeq = -1;

  if (snapshotIndex >= 0) {
    const snapshot = track.snapshots[snapshotIndex];
    language = snapshot.language;
    sourceCode = snapshot.sourceCode;
    eventStartTMs = snapshot.tMs;
    eventStartSeq = snapshot.seq;
  }

  const startEventIndex =
    eventStartSeq >= 0
      ? findFirstEventIndexAfterTimelinePoint(track.events, eventStartTMs, eventStartSeq)
      : 0;

  for (let index = startEventIndex; index < track.events.length; index++) {
    const event = track.events[index];
    if (event.tMs > clampedTimeMs) {
      break;
    }

    switch (event.type) {
      case "insert":
      case "delete":
      case "replace": {
        const nextSourceCode = applyReplayTextChange(sourceCode, event.payload);
        if (nextSourceCode === null) {
          throw new Error(
            `Replay mutation range is invalid at seq=${event.seq}, type=${event.type}.`,
          );
        }
        sourceCode = nextSourceCode;
        break;
      }
      case "language_switch":
        language = event.payload.language;
        break;
    }
  }

  const checkpointIndex = resolveCurrentCheckpointIndex(track.checkpoints, clampedTimeMs);
  const currentCheckpoint =
    checkpointIndex >= 0 ? track.checkpoints[checkpointIndex] : undefined;

  return {
    timeMs: clampedTimeMs,
    language,
    sourceCode,
    checkpointIndex: Math.max(0, checkpointIndex),
    currentCheckpoint,
  };
}
