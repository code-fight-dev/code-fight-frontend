import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReplayMonacoLoadingView } from "@/views/arena-replay-room/ui/code-editor/ReplayMonacoLoadingView";

describe("views/arena-replay-room/ui/code-editor/ReplayMonacoLoadingView", () => {
  it("renders editor loading placeholder", () => {
    render(<ReplayMonacoLoadingView />);

    expect(screen.getByText("Loading editor")).toBeInTheDocument();
  });
});
