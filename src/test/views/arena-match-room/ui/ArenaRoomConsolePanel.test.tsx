import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArenaRoomConsolePanel } from "@/views/arena-match-room/ui/ArenaRoomConsolePanel";
import { createTaskSubmissionFixture } from "@/test/features/arena-room/model/fixtures";

describe("views/arena-match-room/ui/ArenaRoomConsolePanel", () => {
  it("renders submission summary, output and readable status", () => {
    render(
      <ArenaRoomConsolePanel
        isSubmitting={false}
        ownSubmission={createTaskSubmissionFixture({
          id: "submission-abcdef01",
        })}
        outputMessage={"Passed tests: 5/5\nScore: 100"}
        submissionStatus="sent_to_judge"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Match console", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Latest submission: SUBMISSI")).toBeInTheDocument();
    expect(screen.getByText(/Passed tests: 5\/5/)).toBeInTheDocument();
    expect(screen.getByText(/Score: 100/)).toBeInTheDocument();
    expect(screen.getByText("Status: Sent To Judge")).toBeInTheDocument();
  });

  it("renders fallback text when there is no submission yet", () => {
    render(
      <ArenaRoomConsolePanel
        isSubmitting
        ownSubmission={null}
        outputMessage="Waiting for your first run."
        submissionStatus="running"
      />,
    );

    expect(screen.getByText("No submissions yet")).toBeInTheDocument();
    expect(screen.getByText("Waiting for your first run.")).toBeInTheDocument();
    expect(screen.getByText("Status: Running")).toBeInTheDocument();
  });
});
