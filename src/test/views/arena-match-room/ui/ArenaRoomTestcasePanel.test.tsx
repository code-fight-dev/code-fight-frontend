import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArenaRoomTestcasePanel } from "@/views/arena-match-room/ui/ArenaRoomTestcasePanel";
import { createChallengeFixture } from "@/test/fixtures/challenge";

describe("views/arena-match-room/ui/ArenaRoomTestcasePanel", () => {
  it("renders testcase tabs and switches workspace tab/testcase index on click", () => {
    const setActiveWorkspaceTab = vi.fn();
    const setActiveTestcaseIndex = vi.fn();

    const challenge = createChallengeFixture({
      testCases: [
        {
          name: "Case A",
          input: "1 2",
          expectedOutput: "3",
        },
        {
          name: "Case B",
          input: "4 5",
          expectedOutput: "9",
        },
      ],
    });

    render(
      <ArenaRoomTestcasePanel
        challenge={challenge}
        activeWorkspaceTab="testcases"
        activeTestcaseIndex={1}
        setActiveWorkspaceTab={setActiveWorkspaceTab}
        setActiveTestcaseIndex={setActiveTestcaseIndex}
      />,
    );

    expect(screen.getByRole("button", { name: "Testcases" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Console" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Case A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Case B" })).toBeInTheDocument();
    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(screen.getByText("Expected output")).toBeInTheDocument();
    expect(screen.getByText("4 5")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Testcases" }));
    fireEvent.click(screen.getByRole("button", { name: "Console" }));
    fireEvent.click(screen.getByRole("button", { name: "Case A" }));

    expect(setActiveWorkspaceTab).toHaveBeenCalledTimes(2);
    expect(setActiveWorkspaceTab).toHaveBeenNthCalledWith(1, "testcases");
    expect(setActiveWorkspaceTab).toHaveBeenNthCalledWith(2, "console");
    expect(setActiveTestcaseIndex).toHaveBeenCalledTimes(1);
    expect(setActiveTestcaseIndex).toHaveBeenCalledWith(0);
  });

  it("renders fallback text when challenge has no public testcases", () => {
    const challenge = createChallengeFixture({
      testCases: [],
    });

    render(
      <ArenaRoomTestcasePanel
        challenge={challenge}
        activeWorkspaceTab="testcases"
        activeTestcaseIndex={0}
        setActiveWorkspaceTab={vi.fn()}
        setActiveTestcaseIndex={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No public testcases for this challenge."),
    ).toBeInTheDocument();
  });
});
