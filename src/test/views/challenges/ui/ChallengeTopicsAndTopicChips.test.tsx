import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChallengeTopics } from "@/views/challenges/ui/ChallengeTopics";
import { TopicChips } from "@/views/challenges/ui/TopicChips";

describe("views/challenges/ui/ChallengeTopics", () => {
  it("renders all topics and hides overflow count when limit is not reached", () => {
    render(
      <ChallengeTopics
        challenge={{
          kind: "algorithmic",
          tags: ["Array", "Hash Table"],
        }}
      />,
    );

    expect(screen.getByText("Array")).toBeInTheDocument();
    expect(screen.getByText("Hash Table")).toBeInTheDocument();
    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });

  it("renders sql topic prefix and overflow counter when limited", () => {
    render(
      <ChallengeTopics
        challenge={{
          kind: "sql",
          tags: ["Aggregation", "Join", "Window"],
        }}
        limit={2}
        className="custom-topics"
      />,
    );

    expect(screen.getByText("SQL")).toBeInTheDocument();
    expect(screen.getByText("Aggregation")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});

describe("views/challenges/ui/TopicChips", () => {
  it("renders collapsed topics with show-more action and toggles selected topic", () => {
    const topics = Array.from({ length: 16 }, (_, index) => ({
      name: `Topic ${index + 1}`,
      count: index + 1,
    }));
    const onToggleTopic = vi.fn();
    const onToggleExpanded = vi.fn();

    render(
      <TopicChips
        topics={topics}
        selectedTopics={["Topic 2"]}
        expanded={false}
        onToggleExpanded={onToggleExpanded}
        onToggleTopic={onToggleTopic}
      />,
    );

    expect(screen.getByText("16 topics from the starter catalog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 2 more" })).toBeInTheDocument();
    expect(screen.queryByText("Topic 15")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Topic 2/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: /Topic 3/i }));
    expect(onToggleTopic).toHaveBeenCalledWith("Topic 3");

    fireEvent.click(screen.getByRole("button", { name: "Show 2 more" }));
    expect(onToggleExpanded).toHaveBeenCalledTimes(1);
  });

  it("renders expanded list and show-fewer action", () => {
    const topics = Array.from({ length: 3 }, (_, index) => ({
      name: `Topic ${index + 1}`,
      count: index + 1,
    }));

    render(
      <TopicChips
        topics={topics}
        selectedTopics={[]}
        expanded
        onToggleExpanded={vi.fn()}
        onToggleTopic={vi.fn()}
      />,
    );

    expect(screen.getByText("Topic 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show fewer" })).toBeInTheDocument();
  });

  it("hides expand toggle when list is short and not expanded", () => {
    render(
      <TopicChips
        topics={[{ name: "Array", count: 12 }]}
        selectedTopics={[]}
        expanded={false}
        onToggleExpanded={vi.fn()}
        onToggleTopic={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /Show/i })).not.toBeInTheDocument();
  });
});
