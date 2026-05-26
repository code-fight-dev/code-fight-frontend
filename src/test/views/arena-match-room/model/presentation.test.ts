import { describe, expect, it } from "vitest";

import { toReadableStatus, toShortID } from "@/views/arena-match-room/model/presentation";

describe("views/arena-match-room/model/presentation", () => {
  describe("toShortID", () => {
    it("returns the first 8 characters in uppercase", () => {
      expect(toShortID("abc123def456")).toBe("ABC123DE");
    });

    it("handles values shorter than 8 characters", () => {
      expect(toShortID("ab12")).toBe("AB12");
    });

    it("returns an empty string for an empty value", () => {
      expect(toShortID("")).toBe("");
    });
  });

  describe("toReadableStatus", () => {
    it("converts snake_case status to readable title case", () => {
      expect(toReadableStatus("waiting_for_player")).toBe("Waiting For Player");
    });

    it("converts kebab-case status to readable title case", () => {
      expect(toReadableStatus("match-in-progress")).toBe("Match In Progress");
    });

    it("supports mixed separators in one status value", () => {
      expect(toReadableStatus("round_finished-rematch_pending")).toBe(
        "Round Finished Rematch Pending",
      );
    });

    it("keeps a single word status readable", () => {
      expect(toReadableStatus("finished")).toBe("Finished");
    });

    it("filters empty words created by repeated separators", () => {
      expect(toReadableStatus("waiting__for--player")).toBe("Waiting For Player");
    });

    it("returns an empty string for an empty value", () => {
      expect(toReadableStatus("")).toBe("");
    });
  });
});
