import { describe, expect, it } from "vitest";

import { createChallengeFixture } from "@/test/fixtures/challenge";
import {
  WORKSPACE_TABS,
  clamp,
  getInitialChallengeLanguage,
  getInitialCodeByLanguage,
  getWorkspaceActionLabel,
} from "@/views/challenges/model/workspace";

describe("views/challenges/model/workspace", () => {
  it("exposes workspace tabs metadata", () => {
    expect(WORKSPACE_TABS).toEqual([
      { value: "testcases", label: "Testcases" },
      { value: "console", label: "Console" },
    ]);
  });

  it("clamps values inside min/max boundaries", () => {
    expect(clamp(10, 20, 40)).toBe(20);
    expect(clamp(30, 20, 40)).toBe(30);
    expect(clamp(60, 20, 40)).toBe(40);
  });

  it("resolves initial language with default fallback rules", () => {
    expect(
      getInitialChallengeLanguage(
        createChallengeFixture({
          supportedLanguages: ["python", "typescript"],
        }),
      ),
    ).toBe("typescript");

    expect(
      getInitialChallengeLanguage(
        createChallengeFixture({
          supportedLanguages: ["python", "java"],
        }),
      ),
    ).toBe("python");

    expect(
      getInitialChallengeLanguage(
        createChallengeFixture({
          supportedLanguages: [],
        }),
      ),
    ).toBe("typescript");
  });

  it("copies starter code map for initial code by language", () => {
    const challenge = createChallengeFixture({
      starterCodeByLanguage: {
        typescript: "function solveTs() {}",
        python: "def solve_py():\n    pass",
      },
    });

    const initialCode = getInitialCodeByLanguage(challenge);
    expect(initialCode).toEqual(challenge.starterCodeByLanguage);
    expect(initialCode).not.toBe(challenge.starterCodeByLanguage);
  });

  it("returns readable labels for workspace actions", () => {
    expect(getWorkspaceActionLabel("run")).toBe("Run Code");
    expect(getWorkspaceActionLabel("submit")).toBe("Submit");
  });
});
