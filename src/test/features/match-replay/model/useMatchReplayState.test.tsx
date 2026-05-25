import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as ReactModule from "react";

import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import { useMatchReplayState } from "@/features/match-replay/model/useMatchReplayState";
import type {
  MatchReplayLoadState,
  MatchReplayCheckpoint,
  ReplayViewState,
} from "@/features/match-replay/model/types";
import {
  createChallengeFixture,
  createMatchReplayFixture,
  createReplayCheckpointFixture,
  createReplayViewStateFixture,
  createViewerFixture,
} from "./fixtures";

type LoaderParams = {
  matchId: string;
  viewerId: string | null;
  setLoadState: (value: MatchReplayLoadState) => void;
  setErrorMessage: (value: string | null) => void;
  setReplay: (value: MatchReplay | null) => void;
  setChallenge: (value: Challenge | null) => void;
  setActivePlayerId: (value: string | null) => void;
  setCurrentTimeMs: (value: number) => void;
  setIsPlaying: (value: boolean) => void;
  setPlaybackSpeed: (value: number) => void;
};

type PlaybackState = {
  durationMs: number;
  checkpoints: MatchReplayCheckpoint[];
  resolveAtTime: (targetTimeMs: number) => ReplayViewState;
};

const replayStateMocks = vi.hoisted(() => ({
  useViewerSession: vi.fn(),
  buildReplayPlaybackState: vi.fn(),
  useReplayClock: vi.fn(),
  applyLoaderState: vi.fn(),
}));

vi.mock("@/entities/viewer", () => ({
  useViewerSession: replayStateMocks.useViewerSession,
}));

vi.mock("@/features/match-replay/model/playback", () => ({
  buildReplayPlaybackState: replayStateMocks.buildReplayPlaybackState,
}));

vi.mock("@/features/match-replay/model/replay-state/useReplayClock", () => ({
  useReplayClock: replayStateMocks.useReplayClock,
}));

vi.mock("@/features/match-replay/model/replay-state/useReplayLoader", async () => {
  const React = (await vi.importActual("react")) as typeof ReactModule;

  return {
    useReplayLoader: (params: LoaderParams) => {
      const hasAppliedRef = React.useRef(false);

      React.useEffect(() => {
        if (hasAppliedRef.current) {
          return;
        }

        hasAppliedRef.current = true;
        replayStateMocks.applyLoaderState(params);
      }, [params]);
    },
  };
});

describe("features/match-replay/model/useMatchReplayState", () => {
  const readyReplay = createMatchReplayFixture({
    match: {
      id: "match-42",
      status: "finished",
      taskId: "task-42",
    },
  });
  const readyChallenge = createChallengeFixture({
    title: "Replay Challenge",
    summary: "Replay summary",
  });
  const checkpoints = [
    createReplayCheckpointFixture({
      id: "cp-1",
      label: "First",
      tMs: 120,
    }),
    createReplayCheckpointFixture({
      id: "cp-2",
      label: "Second",
      tMs: 620,
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    replayStateMocks.useViewerSession.mockReturnValue({
      viewer: createViewerFixture("viewer-1"),
    });

    replayStateMocks.applyLoaderState.mockImplementation((params: LoaderParams) => {
      params.setLoadState("ready");
      params.setErrorMessage(null);
      params.setReplay(readyReplay);
      params.setChallenge(readyChallenge);
      params.setActivePlayerId("viewer-1");
      params.setCurrentTimeMs(400);
      params.setIsPlaying(false);
      params.setPlaybackSpeed(1.5);
    });

    replayStateMocks.useReplayClock.mockImplementation(() => {});

    replayStateMocks.buildReplayPlaybackState.mockImplementation((): PlaybackState => {
      return {
        durationMs: 900,
        checkpoints,
        resolveAtTime: () =>
          createReplayViewStateFixture({
            timeMs: 400,
            language: "typescript",
            sourceCode: "const score = 42;",
            checkpointIndex: 1,
            currentCheckpoint: checkpoints[1],
          }),
      };
    });
  });

  it("returns mapped replay state and wires playback clock inputs", async () => {
    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.errorMessage).toBeNull();
    expect(result.current.playbackErrorMessage).toBeNull();
    expect(result.current.match).toEqual({
      id: "match-42",
      status: "finished",
      taskId: "task-42",
    });
    expect(result.current.challenge).toEqual({
      title: "Replay Challenge",
      summary: "Replay summary",
    });
    expect(result.current.players).toEqual([
      {
        id: "viewer-1",
        username: "alice",
        displayName: "Alice",
        avatarUrl: "https://example.com/alice.png",
      },
      {
        id: "viewer-2",
        username: "bob",
        displayName: "Bob",
        avatarUrl: "https://example.com/bob.png",
      },
    ]);
    expect(result.current.canViewReplay).toBe(true);
    expect(result.current.canViewSourceCode).toBe(true);
    expect(result.current.activePlayerId).toBe("viewer-1");
    expect(result.current.checkpoints).toEqual(checkpoints);
    expect(result.current.currentCheckpointIndex).toBe(1);
    expect(result.current.currentCode).toBe("const score = 42;");
    expect(result.current.currentLanguage).toBe("typescript");
    expect(result.current.currentTimeMs).toBe(400);
    expect(result.current.durationMs).toBe(900);

    expect(replayStateMocks.buildReplayPlaybackState).toHaveBeenCalledWith(
      readyReplay,
      "viewer-1",
      readyChallenge,
    );
    expect(replayStateMocks.useReplayClock).toHaveBeenCalledWith(
      expect.objectContaining({
        isPlaying: false,
        durationMs: 900,
        safeCurrentTimeMs: 400,
        playbackSpeed: 1.5,
      }),
    );
  });

  it("returns safe defaults when replay or active player is missing", async () => {
    replayStateMocks.applyLoaderState.mockImplementation((params: LoaderParams) => {
      params.setLoadState("ready");
      params.setErrorMessage(null);
      params.setReplay(null);
      params.setChallenge(null);
      params.setActivePlayerId(null);
      params.setCurrentTimeMs(999);
      params.setIsPlaying(true);
      params.setPlaybackSpeed(2);
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.playbackErrorMessage).toBeNull();
    expect(result.current.match).toBeNull();
    expect(result.current.challenge).toBeNull();
    expect(result.current.players).toEqual([]);
    expect(result.current.activePlayerId).toBeNull();
    expect(result.current.checkpoints).toEqual([]);
    expect(result.current.currentCheckpointIndex).toBe(0);
    expect(result.current.canViewReplay).toBe(false);
    expect(result.current.canViewSourceCode).toBe(false);
    expect(result.current.currentCode).toBe("");
    expect(result.current.currentLanguage).toBe("hidden");
    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.durationMs).toBe(0);
    expect(replayStateMocks.buildReplayPlaybackState).not.toHaveBeenCalled();
  });

  it("passes null viewerId to replay loader when viewer session is missing", async () => {
    replayStateMocks.useViewerSession.mockReturnValue({
      viewer: null,
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    const loaderParams = replayStateMocks.applyLoaderState.mock.calls[0]?.[0] as
      | LoaderParams
      | undefined;
    expect(loaderParams?.viewerId).toBeNull();
  });

  it("exposes playback build errors and falls back to replay duration", async () => {
    replayStateMocks.buildReplayPlaybackState.mockImplementation(() => {
      throw new Error("Replay build failed");
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.playbackErrorMessage).toBe("Replay build failed");
    expect(result.current.durationMs).toBe(readyReplay.timeline.durationMs);
    expect(result.current.currentCode).toBe("");
    expect(result.current.currentLanguage).toBe("typescript");
  });

  it("uses fallback playback error message for unknown thrown values", async () => {
    replayStateMocks.buildReplayPlaybackState.mockImplementation(() => {
      throw "boom";
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.playbackErrorMessage).toBe("Replay timeline is invalid.");
  });

  it("exposes resolveAtTime errors from playback", async () => {
    replayStateMocks.buildReplayPlaybackState.mockImplementation((): PlaybackState => {
      return {
        durationMs: 800,
        checkpoints,
        resolveAtTime: () => {
          throw new Error("Replay resolve failed");
        },
      };
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.playbackErrorMessage).toBe("Replay resolve failed");
    expect(result.current.currentCode).toBe("");
    expect(result.current.currentLanguage).toBe("typescript");
  });

  it("uses fallback playback error message for unknown resolveAtTime errors", async () => {
    replayStateMocks.buildReplayPlaybackState.mockImplementation((): PlaybackState => {
      return {
        durationMs: 800,
        checkpoints,
        resolveAtTime: () => {
          throw "boom";
        },
      };
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.playbackErrorMessage).toBe("Replay timeline is invalid.");
    expect(result.current.currentCode).toBe("");
    expect(result.current.currentLanguage).toBe("typescript");
  });

  it("hides source code and language when source visibility is disabled", async () => {
    replayStateMocks.applyLoaderState.mockImplementation((params: LoaderParams) => {
      params.setLoadState("ready");
      params.setErrorMessage(null);
      params.setReplay(
        createMatchReplayFixture({
          permissions: {
            canViewReplay: true,
            canViewSourceCode: false,
          },
        }),
      );
      params.setChallenge(readyChallenge);
      params.setActivePlayerId("viewer-1");
      params.setCurrentTimeMs(300);
      params.setIsPlaying(false);
      params.setPlaybackSpeed(1);
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.currentCode).toBe("");
    expect(result.current.currentLanguage).toBe("hidden");
  });

  it("handles replay controls: player switch, seek, toggle, checkpoint and speed", async () => {
    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    act(() => {
      result.current.togglePlayback();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlayback();
    });
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.seekToTime(2000);
    });
    expect(result.current.currentTimeMs).toBe(900);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.togglePlayback();
    });
    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.seekToCheckpoint(999);
    });
    expect(result.current.currentTimeMs).toBe(620);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.setActivePlayerId("viewer-2");
    });
    expect(result.current.activePlayerId).toBe("viewer-2");
    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.setPlaybackSpeed(0);
      result.current.setPlaybackSpeed(Number.NaN);
    });
    expect(result.current.playbackSpeed).toBe(1.5);

    act(() => {
      result.current.setPlaybackSpeed(1.25);
    });
    expect(result.current.playbackSpeed).toBe(1.25);
  });

  it("ignores checkpoint seek when checkpoint is missing and ignores toggle for zero duration", async () => {
    replayStateMocks.buildReplayPlaybackState.mockImplementation((): PlaybackState => {
      return {
        durationMs: 0,
        checkpoints: [],
        resolveAtTime: () =>
          createReplayViewStateFixture({
            timeMs: 0,
            language: "typescript",
            sourceCode: "",
            checkpointIndex: 0,
            currentCheckpoint: undefined,
          }),
      };
    });

    const { result } = renderHook(() => useMatchReplayState("match-42"));

    await waitFor(() => {
      expect(result.current.loadState).toBe("ready");
    });

    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.seekToCheckpoint(0);
      result.current.togglePlayback();
    });

    expect(result.current.currentTimeMs).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });
});
