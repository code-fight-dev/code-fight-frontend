import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MonacoLoadingView } from "@/views/arena-match-room/ui/code-editor/MonacoLoadingView";

describe("views/arena-match-room/ui/code-editor/MonacoLoadingView", () => {
  it("renders editor loading placeholder", () => {
    render(<MonacoLoadingView />);

    expect(screen.getByText("Loading editor")).toBeInTheDocument();
  });
});
