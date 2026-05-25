import type {
  Match,
  MatchReplay,
  MatchReplayPlayer,
  MatchReplayTimeline,
} from "@/entities/match";
import type {
  MatchReplayCheckpoint,
  ReplayViewState,
} from "@/features/match-replay/model/types";
import { createMatchFixture } from "@/test/entities/match/match.test-helpers";
import { createChallengeFixture } from "@/test/fixtures/challenge";
import { createViewerFixture } from "@/test/fixtures/viewer";

export { createChallengeFixture, createViewerFixture };

export function createReplayPlayerFixture(
  overrides: Partial<MatchReplayPlayer> = {},
): MatchReplayPlayer {
  return {
    id: "viewer-1",
    username: "alice",
    displayName: "Alice",
    avatarUrl: "https://example.com/alice.png",
    ...overrides,
  };
}

export function createReplayTimelineFixture(
  overrides: Partial<MatchReplayTimeline> = {},
): MatchReplayTimeline {
  return {
    version: 1,
    durationMs: 1200,
    events: [],
    snapshots: [],
    submissions: [],
    ...overrides,
  };
}

type ReplayFixtureOverrides = {
  permissions?: Partial<MatchReplay["permissions"]>;
  match?: Partial<Match>;
  players?: MatchReplayPlayer[];
  timeline?: Partial<MatchReplayTimeline>;
};

export function createMatchReplayFixture(
  overrides: ReplayFixtureOverrides = {},
): MatchReplay {
  const basePermissions: MatchReplay["permissions"] = {
    canViewReplay: true,
    canViewSourceCode: true,
  };
  const baseMatch = createMatchFixture({
    id: "match-1",
    taskId: "task-1",
    status: "finished",
  });
  const basePlayers = [
    createReplayPlayerFixture(),
    createReplayPlayerFixture({
      id: "viewer-2",
      username: "bob",
      displayName: "Bob",
      avatarUrl: "https://example.com/bob.png",
    }),
  ];
  const baseTimeline = createReplayTimelineFixture();

  return {
    permissions: {
      ...basePermissions,
      ...overrides.permissions,
    },
    match: {
      ...baseMatch,
      ...overrides.match,
    },
    players: overrides.players ?? basePlayers,
    timeline: {
      ...baseTimeline,
      ...overrides.timeline,
      events: overrides.timeline?.events ?? baseTimeline.events,
      snapshots: overrides.timeline?.snapshots ?? baseTimeline.snapshots,
      submissions: overrides.timeline?.submissions ?? baseTimeline.submissions,
    },
  };
}

export function createReplayCheckpointFixture(
  overrides: Partial<MatchReplayCheckpoint> = {},
): MatchReplayCheckpoint {
  return {
    id: "cp-1",
    label: "Checkpoint",
    tMs: 100,
    status: "finished",
    ...overrides,
  };
}

export function createReplayViewStateFixture(
  overrides: Partial<ReplayViewState> = {},
): ReplayViewState {
  return {
    timeMs: 400,
    language: "typescript",
    sourceCode: "console.log('hello');",
    checkpointIndex: 0,
    ...overrides,
  };
}
