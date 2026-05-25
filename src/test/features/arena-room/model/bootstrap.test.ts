import { beforeEach, describe, expect, it, vi } from "vitest";

import { bootstrapArenaRoom } from "@/features/arena-room/model/bootstrap";
import { createArenaMatchFixture, createChallengeFixture } from "./fixtures";

const bootstrapMocks = vi.hoisted(() => ({
  getMatch: vi.fn(),
  getChallengeByTaskId: vi.fn(),
}));

vi.mock("@/entities/match/client", () => ({
  getMatch: bootstrapMocks.getMatch,
}));

vi.mock("@/entities/challenge/client", () => ({
  getChallengeByTaskId: bootstrapMocks.getChallengeByTaskId,
}));

describe("bootstrapArenaRoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    bootstrapMocks.getMatch.mockResolvedValue(createArenaMatchFixture());
    bootstrapMocks.getChallengeByTaskId.mockResolvedValue(createChallengeFixture());
  });

  it("normalizes match id, loads match/challenge and prefers default language", async () => {
    const challenge = createChallengeFixture({
      supportedLanguages: ["python", "typescript"],
    });
    bootstrapMocks.getChallengeByTaskId.mockResolvedValue(challenge);

    const result = await bootstrapArenaRoom("  match-1 ");

    expect(bootstrapMocks.getMatch).toHaveBeenCalledWith("match-1");
    expect(bootstrapMocks.getChallengeByTaskId).toHaveBeenCalledWith("task-1");
    expect(result.match.id).toBe("match-1");
    expect(result.challenge.id).toBe("challenge-1");
    expect(result.initialLanguage).toBe("typescript");
    expect(result.initialCodeByLanguage).toEqual(challenge.starterCodeByLanguage);
    expect(result.initialCodeByLanguage).not.toBe(challenge.starterCodeByLanguage);
  });

  it("falls back to first supported language when default is not available", async () => {
    bootstrapMocks.getChallengeByTaskId.mockResolvedValue(
      createChallengeFixture({
        supportedLanguages: ["python"],
      }),
    );

    const result = await bootstrapArenaRoom("match-1");
    expect(result.initialLanguage).toBe("python");
  });

  it("throws when match id is empty after trimming", async () => {
    await expect(bootstrapArenaRoom("   ")).rejects.toThrow("Match id is required.");
    expect(bootstrapMocks.getMatch).not.toHaveBeenCalled();
  });

  it("throws when match is not running or finished", async () => {
    bootstrapMocks.getMatch.mockResolvedValue(
      createArenaMatchFixture({
        status: "pending",
      }),
    );

    await expect(bootstrapArenaRoom("match-1")).rejects.toThrow(
      "This match room is only available for running or finished matches.",
    );
  });

  it("throws when task id is missing in match", async () => {
    bootstrapMocks.getMatch.mockResolvedValue(
      createArenaMatchFixture({
        taskId: undefined,
      }),
    );

    await expect(bootstrapArenaRoom("match-1")).rejects.toThrow(
      "Match task is not assigned.",
    );
  });

  it("throws when challenge is not found", async () => {
    bootstrapMocks.getChallengeByTaskId.mockResolvedValue(null);

    await expect(bootstrapArenaRoom("match-1")).rejects.toThrow(
      "Challenge for this match was not found.",
    );
  });

  it("throws when challenge has no supported languages", async () => {
    bootstrapMocks.getChallengeByTaskId.mockResolvedValue(
      createChallengeFixture({
        supportedLanguages: [],
      }),
    );

    await expect(bootstrapArenaRoom("match-1")).rejects.toThrow(
      "No supported languages for this match challenge.",
    );
  });
});
