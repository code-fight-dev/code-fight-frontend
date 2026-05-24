import { describe, expect, it } from "vitest";

import { getDifficultyClassName, parseChallengeDifficulty } from "@/entities/challenge";

describe("getDifficultyClassName", () => {
  it("returns class name for Easy difficulty", () => {
    expect(getDifficultyClassName("Easy")).toBe("challenge-difficulty-easy");
  });

  it("returns class name for Medium difficulty", () => {
    expect(getDifficultyClassName("Medium")).toBe("challenge-difficulty-medium");
  });

  it("returns class name for Hard difficulty", () => {
    expect(getDifficultyClassName("Hard")).toBe("challenge-difficulty-hard");
  });
});

describe("parseChallengeDifficulty", () => {
  it("parses valid difficulty values", () => {
    expect(parseChallengeDifficulty("easy")).toBe("Easy");
    expect(parseChallengeDifficulty("medium")).toBe("Medium");
    expect(parseChallengeDifficulty("hard")).toBe("Hard");
  });

  it("normalizes case and surrounding whitespace", () => {
    expect(parseChallengeDifficulty(" Easy ")).toBe("Easy");
    expect(parseChallengeDifficulty("MEDIUM")).toBe("Medium");
    expect(parseChallengeDifficulty("  HaRd  ")).toBe("Hard");
  });

  it("returns null for empty, missing or unknown values", () => {
    expect(parseChallengeDifficulty("")).toBeNull();
    expect(parseChallengeDifficulty("   ")).toBeNull();
    expect(parseChallengeDifficulty(null)).toBeNull();
    expect(parseChallengeDifficulty(undefined)).toBeNull();
    expect(parseChallengeDifficulty("extreme")).toBeNull();
  });
});
