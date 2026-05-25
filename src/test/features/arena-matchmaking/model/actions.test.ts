import { describe, expect, it, vi } from "vitest";

import { joinQueue, leaveQueue, startMatch } from "@/entities/match/client";
import type { Match } from "@/entities/match";
import {
  acceptMatchmakingMatch,
  cancelMatchmakingQueue,
  joinMatchmakingQueue,
} from "@/features/arena-matchmaking/model/actions";

vi.mock("@/entities/match/client", () => ({
  joinQueue: vi.fn(),
  leaveQueue: vi.fn(),
  startMatch: vi.fn(),
}));

describe("arena-matchmaking actions", () => {
  it("forwards queue input to joinQueue and returns result", async () => {
    const queueResult = { status: "queued" } as const;
    vi.mocked(joinQueue).mockResolvedValue(queueResult);

    await expect(
      joinMatchmakingQueue({
        taskMode: "hard",
        isRated: false,
      }),
    ).resolves.toEqual(queueResult);

    expect(joinQueue).toHaveBeenCalledWith({
      taskMode: "hard",
      isRated: false,
    });
  });

  it("calls leaveQueue when cancelling queue", async () => {
    vi.mocked(leaveQueue).mockResolvedValue(undefined);

    await expect(cancelMatchmakingQueue()).resolves.toBeUndefined();
    expect(leaveQueue).toHaveBeenCalledTimes(1);
  });

  it("forwards match id to startMatch and returns updated match", async () => {
    const match = { id: "match-1" } as unknown as Match;
    vi.mocked(startMatch).mockResolvedValue(match);

    await expect(acceptMatchmakingMatch("match-1")).resolves.toBe(match);
    expect(startMatch).toHaveBeenCalledWith("match-1");
  });
});
