export const parsedMatch = {
  id: "match-1",
};

export const parsedSubmission = {
  id: "submission-1",
};

export const validTimelineEvent = () => ({
  user_id: "player-1",
  seq: 1,
  t_ms: 250,
  type: "code.change",
  payload: {
    value: "console.log('hello')",
  },
});

export const validTimelineSnapshot = () => ({
  user_id: "player-1",
  seq: 1,
  t_ms: 0,
  language: "typescript",
  source_code: "console.log('hello')",
});

export const validTimeline = (overrides: Record<string, unknown> = {}) => ({
  version: 1,
  duration_ms: 1200,
  events: [validTimelineEvent()],
  snapshots: [validTimelineSnapshot()],
  submissions: [
    {
      id: "submission-1",
    },
  ],
  ...overrides,
});

export const validReplay = (overrides: Record<string, unknown> = {}) => ({
  permissions: {
    can_view_replay: true,
    can_view_source_code: false,
  },
  match: {
    id: "match-1",
  },
  players: [
    {
      id: "player-1",
      username: "lyosh",
      display_name: "Lyosh",
      avatar_url: "https://example.com/avatar.png",
    },
    {
      id: "player-2",
      username: "opponent",
      display_name: "Opponent",
      avatar_url: "",
    },
  ],
  timeline: validTimeline(),
  ...overrides,
});
