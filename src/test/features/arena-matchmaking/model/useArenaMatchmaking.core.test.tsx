import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMatch,
  getArenaMocks,
  getLatestPollingInput,
  MatchmakingHarness,
  requirePollingInput,
  requireRealtimeInput,
  resetUseArenaMatchmakingTestState,
} from "./useArenaMatchmaking.test-helpers";

const arenaMocks = getArenaMocks();

describe("useArenaMatchmaking core flows", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    resetUseArenaMatchmakingTestState();
  });

  it("returns guest state and ignores actions without viewer", async () => {
    arenaMocks.useViewerSession.mockReturnValue({
      viewer: null,
    });

    render(<MatchmakingHarness />);

    expect(screen.getByTestId("viewer-id")).toHaveTextContent("none");
    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    expect(screen.getByTestId("is-guest")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "start" }));
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "accept" }));

    await waitFor(() => {
      expect(arenaMocks.getCurrentMatch).not.toHaveBeenCalled();
      expect(arenaMocks.joinMatchmakingQueue).not.toHaveBeenCalled();
      expect(arenaMocks.cancelMatchmakingQueue).not.toHaveBeenCalled();
      expect(arenaMocks.acceptMatchmakingMatch).not.toHaveBeenCalled();
    });
  });

  it("reconciles pending match from bootstrap sync", async () => {
    arenaMocks.getCurrentMatch.mockResolvedValueOnce({
      match: createMatch({
        player1Ready: false,
        player2Ready: true,
      }),
    });

    render(<MatchmakingHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    expect(screen.getByTestId("current-match-id")).toHaveTextContent("match-1");
    expect(screen.getByTestId("self-accepted")).toHaveTextContent("false");
    expect(screen.getByTestId("opponent-accepted")).toHaveTextContent("true");
    expect(getLatestPollingInput()?.enabled).toBe(true);
  });

  it("starts matchmaking with queue settings and keeps searching when queue has no match", async () => {
    render(<MatchmakingHarness />);

    fireEvent.click(screen.getByRole("button", { name: "set-hard" }));
    fireEvent.click(screen.getByRole("button", { name: "set-unrated" }));
    fireEvent.click(screen.getByRole("button", { name: "start" }));

    await waitFor(() => {
      expect(arenaMocks.joinMatchmakingQueue).toHaveBeenCalledWith({
        taskMode: "hard",
        isRated: false,
        ratingMode: "global",
      });
    });

    expect(screen.getByTestId("state")).toHaveTextContent("searching");
    expect(screen.getByTestId("task-mode")).toHaveTextContent("hard");
    expect(screen.getByTestId("is-rated")).toHaveTextContent("false");
    expect(screen.getByTestId("current-match-id")).toHaveTextContent("none");
  });

  it("reconciles matched queue result from action flow", async () => {
    arenaMocks.joinMatchmakingQueue.mockResolvedValueOnce({
      status: "matched",
      match: createMatch({
        player1Ready: true,
        player2Ready: false,
      }),
    });

    render(<MatchmakingHarness />);
    fireEvent.click(screen.getByRole("button", { name: "start" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("waiting_opponent");
    });

    expect(screen.getByTestId("current-match-id")).toHaveTextContent("match-1");
  });

  it("accepts pending match and transitions to starting when server returns running match", async () => {
    arenaMocks.getCurrentMatch.mockResolvedValueOnce({
      match: createMatch({
        player1Ready: false,
        player2Ready: false,
      }),
    });

    arenaMocks.acceptMatchmakingMatch.mockResolvedValueOnce(
      createMatch({
        status: "running",
        player1Ready: true,
        player2Ready: true,
      }),
    );

    render(<MatchmakingHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    fireEvent.click(screen.getByRole("button", { name: "accept" }));

    await waitFor(() => {
      expect(arenaMocks.acceptMatchmakingMatch).toHaveBeenCalledWith("match-1");
    });

    expect(screen.getByTestId("state")).toHaveTextContent("starting");
    expect(screen.getByTestId("running-match-id")).toHaveTextContent("match-1");
    expect(screen.getByTestId("is-busy")).toHaveTextContent("true");
  });

  it("cancels matchmaking and exposes toast message", async () => {
    arenaMocks.getCurrentMatch.mockResolvedValueOnce({
      match: createMatch({
        player1Ready: false,
        player2Ready: false,
      }),
    });

    render(<MatchmakingHarness />);
    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    fireEvent.click(screen.getByRole("button", { name: "cancel" }));

    await waitFor(() => {
      expect(arenaMocks.cancelMatchmakingQueue).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("state")).toHaveTextContent("idle");
      expect(screen.getByTestId("toast-message")).toHaveTextContent(
        "Matchmaking cancelled.",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "clear-toast" }));
    expect(screen.getByTestId("toast-message")).toHaveTextContent("none");
  });

  it("clears stale pending match only after two null poll responses", async () => {
    arenaMocks.getCurrentMatch
      .mockResolvedValueOnce({
        match: createMatch({
          status: "pending",
        }),
      })
      .mockResolvedValueOnce({
        match: null,
      })
      .mockResolvedValueOnce({
        match: null,
      });

    render(<MatchmakingHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    act(() => {
      requirePollingInput().onPoll();
    });

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");
    });

    act(() => {
      requirePollingInput().onPoll();
    });

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("idle");
      expect(screen.getByTestId("current-match-id")).toHaveTextContent("none");
    });
  });

  it("keeps searching state when queued signal repeats and advances search timer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-24T10:00:00.000Z"));

    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onQueued();
    });

    expect(screen.getByTestId("state")).toHaveTextContent("searching");
    expect(screen.getByTestId("search-elapsed")).toHaveTextContent("0");

    act(() => {
      requireRealtimeInput().onQueued();
    });

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByTestId("search-elapsed")).toHaveTextContent("2");
  });
});
