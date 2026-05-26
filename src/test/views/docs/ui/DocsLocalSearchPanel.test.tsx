import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DocsLocalSearchPanel } from "@/views/docs/ui/DocsLocalSearchPanel";

describe("views/docs/ui/DocsLocalSearchPanel", () => {
  it("renders local search info and empty input state", () => {
    render(
      <DocsLocalSearchPanel
        query=""
        resultsCount={0}
        onClear={vi.fn()}
        onQueryChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Local Search")).toBeTruthy();
    expect(
      screen.getByText("Search across guides, API, Monaco settings, lifecycle, and FAQ."),
    ).toBeTruthy();

    const input = screen.getByLabelText("Search documentation");

    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).value).toBe("");
    expect(input.getAttribute("placeholder")).toBe("Search docs...");

    expect(screen.queryByText("0 results")).toBeNull();
    expect(screen.queryByRole("button", { name: "Clear search query" })).toBeNull();
  });

  it("calls onQueryChange when user types into the search input", () => {
    const onQueryChange = vi.fn();

    render(
      <DocsLocalSearchPanel
        query=""
        resultsCount={0}
        onClear={vi.fn()}
        onQueryChange={onQueryChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search documentation"), {
      target: {
        value: "api",
      },
    });

    expect(onQueryChange).toHaveBeenCalledTimes(1);
    expect(onQueryChange).toHaveBeenCalledWith("api");
  });

  it("renders singular result count when query has exactly one match", () => {
    render(
      <DocsLocalSearchPanel
        query="monaco"
        resultsCount={1}
        onClear={vi.fn()}
        onQueryChange={vi.fn()}
      />,
    );

    expect(screen.getByText("1 result")).toBeTruthy();
  });

  it("renders plural result count and clear action when query is active", () => {
    const onClear = vi.fn();

    render(
      <DocsLocalSearchPanel
        query="api"
        resultsCount={3}
        onClear={onClear}
        onQueryChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Search documentation");
    const clearButton = screen.getByRole("button", {
      name: "Clear search query",
    });

    expect((input as HTMLInputElement).value).toBe("api");
    expect(screen.getByText("3 results")).toBeTruthy();

    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
