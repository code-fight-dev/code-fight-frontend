import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Challenge } from "@/entities/challenge";
import type { MatchReplay } from "@/entities/match";
import { useReplayLoader } from "@/features/match-replay/model/replay-state/useReplayLoader";
import { DEFAULT_PLAYBACK_SPEED } from "@/features/match-replay/model/replay-state/constants";
import { createDeferred } from "@/test/helpers/deferred";
import {
  createChallengeFixture,
  createMatchReplayFixture,
  createReplayPlayerFixture,
} from "./fixtures";

const replayLoaderMocks = vi.hoisted(() => ({
  getMatchReplay: vi.fn(),
  getChallengeByTaskId: vi.fn(),
}));

vi.mock("@/entities/match/client", () => ({
  getMatchReplay: replayLoaderMocks.getMatchReplay,
}));

vi.mock("@/entities/challenge/client", () => ({
  getChallengeByTaskId: replayLoaderMocks.getChallengeByTaskId,
}));

type ReplayLoaderParams = Parameters<typeof useReplayLoader>[0];

function createParams(overrides: Partial<ReplayLoaderParams> = {}): ReplayLoaderParams {
  return {
    matchId: "match-1",
    viewerId: "viewer-1",
    setLoadState: vi.fn(),
    setErrorMessage: vi.fn(),
    setReplay: vi.fn(),
    setChallenge: vi.fn(),
    setActivePlayerId: vi.fn(),
    setCurrentTimeMs: vi.fn(),
    setIsPlaying: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    ...overrides,
  };
}

function expectInitialResetCalls(params: ReplayLoaderParams) {
  expect(params.setLoadState).toHaveBeenCalledWith("loading");
  expect(params.setErrorMessage).toHaveBeenCalledWith(null);
  expect(params.setReplay).toHaveBeenCalledWith(null);
  expect(params.setChallenge).toHaveBeenCalledWith(null);
  expect(params.setActivePlayerId).toHaveBeenCalledWith(null);
  expect(params.setCurrentTimeMs).toHaveBeenCalledWith(0);
  expect(params.setIsPlaying).toHaveBeenCalledWith(false);
  expect(params.setPlaybackSpeed).toHaveBeenCalledWith(DEFAULT_PLAYBACK_SPEED);
}

describe("features/match-replay/model/replay-state/useReplayLoader", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    replayLoaderMocks.getMatchReplay.mockResolvedValue(createMatchReplayFixture());
    replayLoaderMocks.getChallengeByTaskId.mockResolvedValue(createChallengeFixture());
  });

  it("loads replay and challenge successfully", async () => {
    const replay = createMatchReplayFixture({
      match: {
        taskId: "task-42",
      },
      players: [
        createReplayPlayerFixture({
          id: "viewer-1",
        }),
        createReplayPlayerFixture({
          id: "viewer-2",
          username: "bob",
          displayName: "Bob",
          avatarUrl: "https://example.com/bob.png",
        }),
      ],
    });
    const challenge = createChallengeFixture({
      taskId: "task-42",
      title: "Replay Challenge",
    });
    replayLoaderMocks.getMatchReplay.mockResolvedValue(replay);
    replayLoaderMocks.getChallengeByTaskId.mockResolvedValue(challenge);

    const params = createParams({
      viewerId: "viewer-2",
    });
    renderHook(() => useReplayLoader(params));

    await waitFor(() => {
      expect(params.setLoadState).toHaveBeenCalledWith("ready");
    });

    expectInitialResetCalls(params);
    expect(replayLoaderMocks.getMatchReplay).toHaveBeenCalledWith("match-1");
    expect(replayLoaderMocks.getChallengeByTaskId).toHaveBeenCalledWith("task-42");
    expect(params.setReplay).toHaveBeenCalledWith(replay);
    expect(params.setChallenge).toHaveBeenCalledWith(challenge);
    expect(params.setActivePlayerId).toHaveBeenCalledWith("viewer-2");
  });

  it("skips challenge loading when replay has no task id", async () => {
    const replay = createMatchReplayFixture({
      match: {
        taskId: undefined,
      },
    });
    replayLoaderMocks.getMatchReplay.mockResolvedValue(replay);

    const params = createParams();
    renderHook(() => useReplayLoader(params));

    await waitFor(() => {
      expect(params.setLoadState).toHaveBeenCalledWith("ready");
    });

    expect(replayLoaderMocks.getChallengeByTaskId).not.toHaveBeenCalled();
    expect(params.setChallenge).toHaveBeenCalledWith(null);
    expect(params.setReplay).toHaveBeenCalledWith(replay);
  });

  it("returns permission error when replay is not viewable", async () => {
    const replay = createMatchReplayFixture({
      permissions: {
        canViewReplay: false,
      },
    });
    replayLoaderMocks.getMatchReplay.mockResolvedValue(replay);

    const params = createParams();
    renderHook(() => useReplayLoader(params));

    await waitFor(() => {
      expect(params.setLoadState).toHaveBeenCalledWith("error");
    });

    expect(params.setErrorMessage).toHaveBeenCalledWith(
      "You do not have permission to view this replay.",
    );
    expect(replayLoaderMocks.getChallengeByTaskId).not.toHaveBeenCalled();
    expect(params.setReplay).not.toHaveBeenCalledWith(replay);
  });

  it("continues with null challenge when challenge request fails", async () => {
    const replay = createMatchReplayFixture({
      match: {
        taskId: "task-42",
      },
    });
    replayLoaderMocks.getMatchReplay.mockResolvedValue(replay);
    replayLoaderMocks.getChallengeByTaskId.mockRejectedValue(
      new Error("challenge is unavailable"),
    );

    const params = createParams();
    renderHook(() => useReplayLoader(params));

    await waitFor(() => {
      expect(params.setLoadState).toHaveBeenCalledWith("ready");
    });

    expect(params.setReplay).toHaveBeenCalledWith(replay);
    expect(params.setChallenge).toHaveBeenCalledWith(null);
    expect(params.setActivePlayerId).toHaveBeenCalledWith("viewer-1");
  });

  it("maps replay loading failures to error messages", async () => {
    replayLoaderMocks.getMatchReplay.mockRejectedValueOnce(
      new Error("Replay API failed"),
    );
    replayLoaderMocks.getMatchReplay.mockRejectedValueOnce("boom");

    const paramsWithKnownError = createParams();
    renderHook(() => useReplayLoader(paramsWithKnownError));

    await waitFor(() => {
      expect(paramsWithKnownError.setLoadState).toHaveBeenCalledWith("error");
    });
    expect(paramsWithKnownError.setErrorMessage).toHaveBeenCalledWith(
      "Replay API failed",
    );

    const paramsWithUnknownError = createParams({
      matchId: "match-2",
    });
    renderHook(() => useReplayLoader(paramsWithUnknownError));

    await waitFor(() => {
      expect(paramsWithUnknownError.setLoadState).toHaveBeenCalledWith("error");
    });
    expect(paramsWithUnknownError.setErrorMessage).toHaveBeenCalledWith(
      "Failed to load replay.",
    );
  });

  it("does not apply results after unmount when replay request resolves or rejects late", async () => {
    const replayDeferred = createDeferred<MatchReplay>();
    replayLoaderMocks.getMatchReplay.mockImplementationOnce(() => replayDeferred.promise);

    const paramsOnResolve = createParams();
    const resolvedRun = renderHook(() => useReplayLoader(paramsOnResolve));
    resolvedRun.unmount();
    await act(async () => {
      replayDeferred.resolve(createMatchReplayFixture());
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(paramsOnResolve.setLoadState).not.toHaveBeenCalledWith("ready");
    expect(paramsOnResolve.setLoadState).not.toHaveBeenCalledWith("error");
    expect(paramsOnResolve.setReplay).toHaveBeenCalledTimes(1);

    const replayRejectDeferred = createDeferred<MatchReplay>();
    replayLoaderMocks.getMatchReplay.mockImplementationOnce(
      () => replayRejectDeferred.promise,
    );

    const paramsOnReject = createParams({
      matchId: "match-late-reject",
    });
    const rejectedRun = renderHook(() => useReplayLoader(paramsOnReject));
    rejectedRun.unmount();
    await act(async () => {
      replayRejectDeferred.reject(new Error("late failure"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(paramsOnReject.setLoadState).not.toHaveBeenCalledWith("ready");
    expect(paramsOnReject.setLoadState).not.toHaveBeenCalledWith("error");
    expect(paramsOnReject.setErrorMessage).not.toHaveBeenCalledWith("late failure");
  });

  it("does not apply replay state after unmount while challenge is still loading", async () => {
    const replay = createMatchReplayFixture({
      match: {
        taskId: "task-99",
      },
    });
    const challengeDeferred = createDeferred<Challenge>();
    replayLoaderMocks.getMatchReplay.mockResolvedValue(replay);
    replayLoaderMocks.getChallengeByTaskId.mockImplementationOnce(
      () => challengeDeferred.promise,
    );

    const params = createParams({
      matchId: "match-cancel-challenge",
    });
    const run = renderHook(() => useReplayLoader(params));

    await waitFor(() => {
      expect(replayLoaderMocks.getChallengeByTaskId).toHaveBeenCalledWith("task-99");
    });

    run.unmount();
    await act(async () => {
      challengeDeferred.resolve(createChallengeFixture());
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(params.setLoadState).not.toHaveBeenCalledWith("ready");
    expect(params.setReplay).toHaveBeenCalledTimes(1);
    expect(params.setChallenge).toHaveBeenCalledTimes(1);
  });
});
