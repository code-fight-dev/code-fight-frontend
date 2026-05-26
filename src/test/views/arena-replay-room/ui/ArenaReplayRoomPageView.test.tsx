import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UseMatchReplayStateResult } from "@/features/match-replay/model/types";
import { ArenaReplayRoomPageView } from "@/views/arena-replay-room/ui/ArenaReplayRoomPageView";

const replayPageMocks = vi.hoisted(() => ({
  useMatchReplayState: vi.fn(),
  ArenaReplayHeaderBar: vi.fn(),
  ArenaReplayTimelinePanel: vi.fn(),
  ArenaReplayCodePanel: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/match-replay", () => ({
  useMatchReplayState: replayPageMocks.useMatchReplayState,
}));

vi.mock("@/views/arena-replay-room/ui/ArenaReplayHeaderBar", () => ({
  ArenaReplayHeaderBar: (props: Record<string, unknown>) => {
    replayPageMocks.ArenaReplayHeaderBar(props);
    return <div data-testid="replay-header-bar">header</div>;
  },
}));

vi.mock("@/views/arena-replay-room/ui/ArenaReplayTimelinePanel", () => ({
  ArenaReplayTimelinePanel: (props: Record<string, unknown>) => {
    replayPageMocks.ArenaReplayTimelinePanel(props);
    return <div data-testid="replay-timeline-panel">timeline</div>;
  },
}));

vi.mock("@/views/arena-replay-room/ui/ArenaReplayCodePanel", () => ({
  ArenaReplayCodePanel: (props: Record<string, unknown>) => {
    replayPageMocks.ArenaReplayCodePanel(props);
    return <div data-testid="replay-code-panel">code</div>;
  },
}));

function createReadyReplayState(
  overrides: Partial<UseMatchReplayStateResult> = {},
): UseMatchReplayStateResult {
  return {
    loadState: "ready",
    errorMessage: null,
    playbackErrorMessage: null,
    match: {
      id: "match-42",
      status: "finished",
      taskId: "task-abcdef12",
    },
    challenge: {
      title: "Replay challenge",
      summary: "Review the final accepted run.",
    },
    canViewReplay: true,
    canViewSourceCode: true,
    players: [
      {
        id: "viewer-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: "",
      },
      {
        id: "viewer-2",
        username: "bob",
        displayName: "Bob",
        avatarUrl: "",
      },
    ],
    activePlayerId: "viewer-1",
    checkpoints: [
      {
        id: "cp-1",
        label: "Attempt 1",
        tMs: 1200,
        verdict: "wrong_answer",
        status: "finished",
      },
      {
        id: "cp-2",
        label: "Attempt 2",
        tMs: 2200,
        verdict: "accepted",
        status: "finished",
      },
    ],
    currentCheckpointIndex: 1,
    isPlaying: false,
    playbackSpeed: 1.5,
    currentCode: "const replay = true;",
    currentLanguage: "typescript",
    currentTimeMs: 2200,
    durationMs: 6000,
    setActivePlayerId: vi.fn(),
    seekToTime: vi.fn(),
    seekToCheckpoint: vi.fn(),
    togglePlayback: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    ...overrides,
  };
}

function renderReplayPage(
  props: ComponentProps<typeof ArenaReplayRoomPageView> = { matchId: "match-42" },
) {
  return render(<ArenaReplayRoomPageView {...props} />);
}

describe("views/arena-replay-room/ui/ArenaReplayRoomPageView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton while replay data is loading", () => {
    replayPageMocks.useMatchReplayState.mockReturnValue(
      createReadyReplayState({
        loadState: "loading",
      }),
    );

    const { container } = renderReplayPage();

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
    expect(screen.queryByTestId("replay-header-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("replay-code-panel")).not.toBeInTheDocument();
  });

  it("renders explicit error message when load state is error", () => {
    replayPageMocks.useMatchReplayState.mockReturnValue(
      createReadyReplayState({
        loadState: "error",
        errorMessage: "Replay data is unavailable.",
      }),
    );

    renderReplayPage();

    expect(
      screen.getByRole("heading", { name: "Replay unavailable", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Replay data is unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to arena" })).toHaveAttribute(
      "href",
      "/arena",
    );
  });

  it("renders playback error message when replay build failed", () => {
    replayPageMocks.useMatchReplayState.mockReturnValue(
      createReadyReplayState({
        playbackErrorMessage: "Replay timeline is invalid.",
      }),
    );

    renderReplayPage();

    expect(screen.getByText("Replay timeline is invalid.")).toBeInTheDocument();
  });

  it("renders fallback unavailable message when replay visibility or state data is missing", () => {
    replayPageMocks.useMatchReplayState.mockReturnValue(
      createReadyReplayState({
        match: null,
        activePlayerId: null,
        canViewReplay: false,
      }),
    );

    renderReplayPage();

    expect(screen.getByText("Unable to open this replay right now.")).toBeInTheDocument();
  });

  it("renders replay layout and forwards replay controls in ready state", () => {
    const replayState = createReadyReplayState();
    replayPageMocks.useMatchReplayState.mockReturnValue(replayState);

    renderReplayPage({
      matchId: "match-room-77",
    });

    expect(replayPageMocks.useMatchReplayState).toHaveBeenCalledWith("match-room-77");
    expect(screen.getByTestId("replay-header-bar")).toBeInTheDocument();
    expect(screen.getByTestId("replay-timeline-panel")).toBeInTheDocument();
    expect(screen.getByTestId("replay-code-panel")).toBeInTheDocument();

    expect(screen.getByText("Challenge")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Replay challenge", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Review the final accepted run.")).toBeInTheDocument();

    expect(replayPageMocks.ArenaReplayHeaderBar).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: "match-42",
        status: "finished",
        players: replayState.players,
        activePlayerId: "viewer-1",
        onSelectPlayer: replayState.setActivePlayerId,
      }),
    );

    expect(replayPageMocks.ArenaReplayTimelinePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        checkpoints: replayState.checkpoints,
        currentCheckpointIndex: 1,
        currentTimeMs: 2200,
        durationMs: 6000,
        isPlaying: false,
        playbackSpeed: 1.5,
        onSeekToTime: replayState.seekToTime,
        onSeekToCheckpoint: replayState.seekToCheckpoint,
        onTogglePlayback: replayState.togglePlayback,
        onChangePlaybackSpeed: replayState.setPlaybackSpeed,
      }),
    );

    expect(replayPageMocks.ArenaReplayCodePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        canViewSourceCode: true,
        language: "typescript",
        code: "const replay = true;",
        title: "Replay challenge",
        verdict: "accepted",
        status: "finished",
      }),
    );
  });

  it("falls back challenge title to task id when challenge data is missing", () => {
    replayPageMocks.useMatchReplayState.mockReturnValue(
      createReadyReplayState({
        challenge: null,
      }),
    );

    renderReplayPage();

    expect(
      screen.getByRole("heading", { name: "Task task-abc", level: 2 }),
    ).toBeInTheDocument();
    expect(replayPageMocks.ArenaReplayCodePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Task task-abc",
      }),
    );
  });

  it("falls back challenge title to generic value when task id is absent", () => {
    replayPageMocks.useMatchReplayState.mockReturnValue(
      createReadyReplayState({
        challenge: null,
        match: {
          id: "match-42",
          status: "finished",
          taskId: null,
        },
        checkpoints: [],
        currentCheckpointIndex: 0,
      }),
    );

    renderReplayPage();

    expect(
      screen.getByRole("heading", { name: "Match task", level: 2 }),
    ).toBeInTheDocument();
    expect(replayPageMocks.ArenaReplayCodePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Match task",
        verdict: undefined,
        status: undefined,
      }),
    );
  });
});
