import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ChallengeListItem } from "@/entities/challenge";
import { getChallengeBySlug, getChallengesPageData } from "@/views/challenges/server";
import { getChallengeTopicLabels } from "@/entities/challenge";
import {
  getChallengeBySlug as serverGetChallengeBySlug,
  getChallenges,
} from "@/entities/challenge/server";

vi.mock("server-only", () => ({}));

vi.mock("@/entities/challenge", () => ({
  getChallengeTopicLabels: vi.fn((challenge: { topicLabels?: string[] }) => {
    return challenge.topicLabels ?? [];
  }),
}));

vi.mock("@/entities/challenge/server", () => ({
  getChallenges: vi.fn(),
  getChallengeBySlug: vi.fn(),
}));

const mockedGetChallenges = vi.mocked(getChallenges);
const mockedGetChallengeTopicLabels = vi.mocked(getChallengeTopicLabels);

function createChallenge(slug: string, topicLabels: string[]): ChallengeListItem {
  return {
    id: slug,
    slug,
    title: slug,
    description: "Test challenge description",
    difficulty: "easy",
    topicLabels,
  } as unknown as ChallengeListItem;
}

describe("views/challenges/server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns challenges and builds topic counters sorted by count and name", async () => {
    const challenges = [
      createChallenge("strings-basics", ["Strings", "Hash Table", "Arrays"]),
      createChallenge("array-map", ["Hash Table", "Arrays"]),
    ];

    mockedGetChallenges.mockResolvedValue({ challenges });

    await expect(getChallengesPageData()).resolves.toEqual({
      challenges,
      topics: [
        { name: "Arrays", count: 2 },
        { name: "Hash Table", count: 2 },
        { name: "Strings", count: 1 },
      ],
    });

    expect(mockedGetChallenges).toHaveBeenCalledTimes(1);
    expect(mockedGetChallengeTopicLabels).toHaveBeenCalledTimes(2);
    expect(mockedGetChallengeTopicLabels).toHaveBeenNthCalledWith(1, challenges[0]);
    expect(mockedGetChallengeTopicLabels).toHaveBeenNthCalledWith(2, challenges[1]);
  });

  it("returns an empty topic list when there are no challenges", async () => {
    const challenges: ChallengeListItem[] = [];

    mockedGetChallenges.mockResolvedValue({ challenges });

    await expect(getChallengesPageData()).resolves.toEqual({
      challenges: [],
      topics: [],
    });

    expect(mockedGetChallenges).toHaveBeenCalledTimes(1);
    expect(mockedGetChallengeTopicLabels).not.toHaveBeenCalled();
  });

  it("re-exports getChallengeBySlug from the challenge server API", () => {
    expect(getChallengeBySlug).toBe(serverGetChallengeBySlug);
  });
});
