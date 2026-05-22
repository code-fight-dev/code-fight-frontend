import type {
  MatchReplay,
  MatchReplayPermissions,
  MatchReplayPlayer,
  MatchReplayTimeline,
  MatchReplayTimelineEvent,
  MatchReplayTimelineSnapshot,
} from "../types";
import { parseMatchFromSnakeCase } from "./match";
import { parseMatchSubmissionFromSnakeCase } from "./submission";
import { isRecord, readOptionalBoolean, readRequiredNumber, readString } from "./scalars";

function parseReplayPermissions(value: unknown): MatchReplayPermissions | null {
  if (!isRecord(value)) {
    return null;
  }

  const canViewReplay = readOptionalBoolean(value.can_view_replay ?? value.canViewReplay);
  const canViewSourceCode = readOptionalBoolean(
    value.can_view_source_code ?? value.canViewSourceCode,
  );

  if (typeof canViewReplay !== "boolean" || typeof canViewSourceCode !== "boolean") {
    return null;
  }

  return {
    canViewReplay,
    canViewSourceCode,
  };
}

function parseReplayPlayer(value: unknown): MatchReplayPlayer | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id).trim();
  const username = readString(value.username).trim();
  const displayName = readString(value.display_name ?? value.displayName).trim();
  const avatarUrl = readString(value.avatar_url ?? value.avatarUrl);

  if (!id || !username || !displayName) {
    return null;
  }

  return {
    id,
    username,
    displayName,
    avatarUrl,
  };
}

function parseReplayTimelineEvent(value: unknown): MatchReplayTimelineEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId = readString(value.user_id ?? value.userId).trim();
  const seq = readRequiredNumber(value.seq);
  const tMs = readRequiredNumber(value.t_ms ?? value.tMs);
  const type = readString(value.type).trim();
  const payload = isRecord(value.payload) ? value.payload : null;

  if (!userId || seq === null || tMs === null || !type || !payload) {
    return null;
  }

  return {
    userId,
    seq,
    tMs,
    type,
    payload,
  };
}

function parseReplayTimelineSnapshot(value: unknown): MatchReplayTimelineSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  const userId = readString(value.user_id ?? value.userId).trim();
  const seq = readRequiredNumber(value.seq);
  const tMs = readRequiredNumber(value.t_ms ?? value.tMs);
  const language = readString(value.language).trim();
  const sourceCode = readString(value.source_code ?? value.sourceCode);

  if (!userId || seq === null || tMs === null || !language) {
    return null;
  }

  return {
    userId,
    seq,
    tMs,
    language,
    sourceCode,
  };
}

function parseReplayTimeline(value: unknown): MatchReplayTimeline | null {
  if (!isRecord(value)) {
    return null;
  }

  const version = readRequiredNumber(value.version);
  const durationMs = readRequiredNumber(value.duration_ms ?? value.durationMs);
  if (version === null || durationMs === null) {
    return null;
  }

  if (!Array.isArray(value.events) || !Array.isArray(value.snapshots)) {
    return null;
  }

  const rawEvents = value.events;
  const rawSnapshots = value.snapshots;
  const rawSubmissions = Array.isArray(value.submissions) ? value.submissions : [];

  const events = rawEvents
    .map(parseReplayTimelineEvent)
    .filter((item): item is MatchReplayTimelineEvent => item !== null);
  const snapshots = rawSnapshots
    .map(parseReplayTimelineSnapshot)
    .filter((item): item is MatchReplayTimelineSnapshot => item !== null);
  const submissions = rawSubmissions
    .map(parseMatchSubmissionFromSnakeCase)
    .filter((item) => item !== null);

  if (
    events.length !== rawEvents.length ||
    snapshots.length !== rawSnapshots.length ||
    submissions.length !== rawSubmissions.length
  ) {
    return null;
  }

  return {
    version,
    durationMs,
    events,
    snapshots,
    submissions,
  };
}

export function parseMatchReplayFromSnakeCase(value: unknown): MatchReplay | null {
  if (!isRecord(value)) {
    return null;
  }

  const permissions = parseReplayPermissions(value.permissions);
  const match = parseMatchFromSnakeCase(value.match);
  const timeline = parseReplayTimeline(value.timeline);
  const rawPlayers = Array.isArray(value.players) ? value.players : null;

  if (!permissions || !match || !timeline || !rawPlayers) {
    return null;
  }

  const players = rawPlayers
    .map(parseReplayPlayer)
    .filter((player): player is MatchReplayPlayer => player !== null);
  if (players.length !== rawPlayers.length) {
    return null;
  }

  return {
    permissions,
    match,
    players,
    timeline,
  };
}
