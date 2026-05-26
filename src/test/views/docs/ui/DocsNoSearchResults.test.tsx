import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocsNoSearchResults } from "@/views/docs/ui/DocsNoSearchResults";

describe("views/docs/ui/DocsNoSearchResults", () => {
  it("renders empty search result message with the current query and suggestions", () => {
    render(<DocsNoSearchResults query="unknown topic" />);

    expect(
      screen.getByRole("heading", { name: "No documentation matches" }),
    ).toBeTruthy();

    const message = screen.getByText((_, element) => {
      return (
        element?.tagName.toLowerCase() === "p" &&
        element.textContent?.includes("Nothing found for") === true
      );
    });

    expect(message).toHaveTextContent(/Nothing found for\s*"unknown topic"\s*\./);
    expect(message).toHaveTextContent("Try a shorter keyword like");

    expect(screen.getByText("arena")).toBeTruthy();
    expect(screen.getByText("editor")).toBeTruthy();
    expect(screen.getByText("api")).toBeTruthy();
  });
});
