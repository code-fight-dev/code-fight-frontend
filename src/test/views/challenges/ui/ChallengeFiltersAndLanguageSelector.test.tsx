import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChallengesActiveFilters } from "@/views/challenges/ui/ChallengesActiveFilters";
import { ChallengeFilters } from "@/views/challenges/ui/ChallengeFilters";
import { LanguageSelector } from "@/views/challenges/ui/LanguageSelector";

vi.mock("@/shared/ui/Select", () => ({
  Select: ({
    value,
    options,
    onValueChange,
    ...rest
  }: {
    value: string;
    options: Array<{ value: string; label: string }>;
    onValueChange: (value: string) => void;
    "aria-label"?: string;
    [key: string]: unknown;
  }) => (
    <select
      data-testid={`select-${String(rest["aria-label"] ?? "default")}`}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

describe("views/challenges/ui/LanguageSelector", () => {
  it("renders language options and emits selected value", () => {
    const onChange = vi.fn();
    render(
      <LanguageSelector
        languages={["typescript", "python"]}
        value="typescript"
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByTestId("select-Language"), {
      target: { value: "python" },
    });

    expect(onChange).toHaveBeenCalledWith("python");
  });
});

describe("views/challenges/ui/ChallengeFilters", () => {
  it("wires query, select controls, difficulty toggles and clear button", () => {
    const onQueryChange = vi.fn();
    const onLanguageChange = vi.fn();
    const onSortChange = vi.fn();
    const onToggleDifficulty = vi.fn();
    const onClearFilters = vi.fn();

    render(
      <ChallengeFilters
        query="two sum"
        selectedDifficulties={["Easy"]}
        selectedLanguage="typescript"
        sort="recommended"
        activeFilterCount={2}
        onQueryChange={onQueryChange}
        onToggleDifficulty={onToggleDifficulty}
        onLanguageChange={onLanguageChange}
        onSortChange={onSortChange}
        onClearFilters={onClearFilters}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search by title, tag, or pattern"), {
      target: { value: "graph" },
    });
    expect(onQueryChange).toHaveBeenCalledWith("graph");

    fireEvent.change(screen.getByTestId("select-Language"), {
      target: { value: "python" },
    });
    expect(onLanguageChange).toHaveBeenCalledWith("python");

    fireEvent.change(screen.getByTestId("select-Sort challenges"), {
      target: { value: "popular" },
    });
    expect(onSortChange).toHaveBeenCalledWith("popular");

    fireEvent.click(screen.getByRole("button", { name: "Hard" }));
    expect(onToggleDifficulty).toHaveBeenCalledWith("Hard");

    fireEvent.click(screen.getByRole("button", { name: /Clear filters/i }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("hides clear button when no active filters", () => {
    render(
      <ChallengeFilters
        query=""
        selectedDifficulties={[]}
        selectedLanguage="all"
        sort="recommended"
        activeFilterCount={0}
        onQueryChange={vi.fn()}
        onToggleDifficulty={vi.fn()}
        onLanguageChange={vi.fn()}
        onSortChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Clear filters/i }),
    ).not.toBeInTheDocument();
  });
});

describe("views/challenges/ui/ChallengesActiveFilters", () => {
  it("renders all active filter chips and calls remove/reset handlers", () => {
    const onRemoveQuery = vi.fn();
    const onRemoveDifficulty = vi.fn();
    const onRemoveTopic = vi.fn();
    const onResetLanguage = vi.fn();

    render(
      <ChallengesActiveFilters
        query="  graph  "
        selectedDifficulties={["Hard"]}
        selectedTopics={["BFS"]}
        selectedLanguage="python"
        onRemoveQuery={onRemoveQuery}
        onRemoveDifficulty={onRemoveDifficulty}
        onRemoveTopic={onRemoveTopic}
        onResetLanguage={onResetLanguage}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove filter search graph" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove filter Hard" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove filter BFS" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove filter Python" }));

    expect(onRemoveQuery).toHaveBeenCalledTimes(1);
    expect(onRemoveDifficulty).toHaveBeenCalledWith("Hard");
    expect(onRemoveTopic).toHaveBeenCalledWith("BFS");
    expect(onResetLanguage).toHaveBeenCalledTimes(1);
  });

  it("omits query/language chips for empty query and all language", () => {
    render(
      <ChallengesActiveFilters
        query="   "
        selectedDifficulties={[]}
        selectedTopics={[]}
        selectedLanguage="all"
        onRemoveQuery={vi.fn()}
        onRemoveDifficulty={vi.fn()}
        onRemoveTopic={vi.fn()}
        onResetLanguage={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Remove filter search/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Remove filter TypeScript/i }),
    ).not.toBeInTheDocument();
  });
});
