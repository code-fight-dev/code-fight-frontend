import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { Match } from "@/entities/match";
import {
  createMatch,
  MatchmakingHarness,
  requireRealtimeInput,
  resetUseArenaMatchmakingTestState,
} from "./useArenaMatchmaking.test-helpers";

describe("useArenaMatchmaking realtime snapshots", () => {
  beforeEach(() => {
    resetUseArenaMatchmakingTestState();
  });

  it("reacts to realtime connection and running snapshot callbacks", () => {
    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onConnected(true);
    });
    expect(screen.getByTestId("is-sse-connected")).toHaveTextContent("true");

    act(() => {
      requireRealtimeInput().onQueued();
    });
    expect(screen.getByTestId("state")).toHaveTextContent("searching");

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          status: "running",
          player1Ready: true,
          player2Ready: true,
        }),
        "sse",
      );
    });

    expect(screen.getByTestId("state")).toHaveTextContent("starting");
    expect(screen.getByTestId("running-match-id")).toHaveTextContent("match-1");
  });

  it("ignores stale non-action snapshots when a newer snapshot is already applied", () => {
    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          id: "fresh-running",
          status: "running",
          player1Ready: true,
          player2Ready: true,
          updatedAt: "2026-05-24T10:00:10.000Z",
        }),
        "sse",
      );
    });

    expect(screen.getByTestId("state")).toHaveTextContent("starting");
    expect(screen.getByTestId("current-match-id")).toHaveTextContent("fresh-running");

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          id: "stale-cancelled",
          status: "cancelled",
          updatedAt: "2026-05-24T10:00:00.000Z",
        }),
        "sse",
      );
    });

    expect(screen.getByTestId("state")).toHaveTextContent("starting");
    expect(screen.getByTestId("current-match-id")).toHaveTextContent("fresh-running");
    expect(screen.getByTestId("toast-message")).toHaveTextContent("none");
  });

  it("moves to idle with cancel toast when cancelled snapshot arrives in active state", () => {
    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onQueued();
    });
    expect(screen.getByTestId("state")).toHaveTextContent("searching");

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          status: "cancelled",
          updatedAt: "2026-05-24T10:00:20.000Z",
        }),
        "sse",
      );
    });

    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    expect(screen.getByTestId("toast-message")).toHaveTextContent("Match was cancelled.");
  });

  it("does not set cancel toast when cancelled snapshot arrives while already idle", () => {
    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          status: "cancelled",
        }),
        "sse",
      );
    });

    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    expect(screen.getByTestId("toast-message")).toHaveTextContent("none");
  });

  it("returns to idle when finished snapshot arrives", () => {
    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          status: "pending",
          updatedAt: "2026-05-24T10:00:10.000Z",
        }),
        "sse",
      );
    });
    expect(screen.getByTestId("state")).toHaveTextContent("pending_accept");

    act(() => {
      requireRealtimeInput().onMatchSnapshot(
        createMatch({
          status: "finished",
          updatedAt: "2026-05-24T10:00:20.000Z",
        }),
        "sse",
      );
    });

    expect(screen.getByTestId("state")).toHaveTextContent("idle");
    expect(screen.getByTestId("current-match-id")).toHaveTextContent("none");
  });

  it("ignores snapshot with unknown status without resetting current state", () => {
    render(<MatchmakingHarness />);

    act(() => {
      requireRealtimeInput().onQueued();
    });
    expect(screen.getByTestId("state")).toHaveTextContent("searching");

    const unknownStatusMatch = {
      ...createMatch({
        id: "unknown-status",
        updatedAt: "2026-05-24T10:00:30.000Z",
      }),
      status: "unexpected_status",
    } as unknown as Match;

    act(() => {
      requireRealtimeInput().onMatchSnapshot(unknownStatusMatch, "sse");
    });

    expect(screen.getByTestId("state")).toHaveTextContent("searching");
    expect(screen.getByTestId("current-match-id")).toHaveTextContent("none");
  });
});
