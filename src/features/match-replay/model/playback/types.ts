import type { ReplayParsedTimelineEvent } from "../protocol";
import type { MatchReplayCheckpoint } from "../types";

export type ReplaySnapshotPoint = {
  seq: number;
  tMs: number;
  language: string;
  sourceCode: string;
};

export type ReplayTrack = {
  initialLanguage: string;
  initialSourceCode: string;
  durationMs: number;
  events: ReplayParsedTimelineEvent[];
  snapshots: ReplaySnapshotPoint[];
  checkpoints: MatchReplayCheckpoint[];
};
