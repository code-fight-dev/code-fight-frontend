import { describe, expect, it } from "vitest";

import {
  formatAttempts,
  getChallengeLanguageScope,
} from "@/views/challenges/model/presentation";

describe("views/challenges/model/presentation", () => {
  it("formats attempts for values below and above 1000", () => {
    expect(formatAttempts(999)).toBe("999");
    expect(formatAttempts(1000)).toBe("1.0k");
    expect(formatAttempts(15230)).toBe("15.2k");
  });

  it("returns language scope labels for challenge kind", () => {
    expect(getChallengeLanguageScope("algorithmic")).toBe("Any language");
    expect(getChallengeLanguageScope("sql")).toBe("SQL");
  });
});
