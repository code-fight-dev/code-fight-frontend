import { describe, expect, it } from "vitest";
import { parseChallengeFromTaskPayload, parseVerdict } from "@/entities/challenge";
import { parseMatchSubmissionFromSnakeCase } from "@/entities/match";

describe("multilanguage execution contract", () => {
  it("retains the enabled runtime versions and starter functions from the backend", () => {
    const languageVersions = { cpp: "20", javascript: "node24", typescript: "5.9.3" };
    const starterCodeByLanguage = {
      cpp: "int Solve(std::vector<int> values) { return 0; }",
      javascript: "function Solve(values) { return 0; }",
      typescript: "function Solve(values: number[]): number { return 0; }",
    };
    const challenge = parseChallengeFromTaskPayload({
      id: "task-1",
      slug: "sum",
      title: "Sum",
      supportedLanguages: Object.keys(languageVersions),
      languageVersions,
      starterCodeByLanguage,
    });
    expect(challenge?.languageVersions).toEqual(languageVersions);
    expect(challenge?.starterCodeByLanguage).toEqual(starterCodeByLanguage);
  });

  it.each(["output_limit_exceeded", "output_directory_limit_exceeded"])(
    "preserves supervisor verdict %s",
    (verdict) => expect(parseVerdict(verdict)).toBe(verdict),
  );

  it.each(["output_limit_exceeded", "output_directory_limit_exceeded"])(
    "retains arena results with verdict %s",
    (verdict) => {
      const result = parseMatchSubmissionFromSnakeCase({
        id: "submission-1",
        task_id: "task-1",
        user_id: "user-1",
        language: "javascript",
        language_version: "node24",
        status: "finished",
        verdict,
        passed_tests: 0,
        total_tests: 1,
        score: 0,
        created_at: "2026-10-14T12:00:00Z",
        updated_at: "2026-10-14T12:00:01Z",
      });
      expect(result?.verdict).toBe(verdict);
    },
  );
});
