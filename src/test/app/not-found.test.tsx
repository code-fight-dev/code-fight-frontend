import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("app/not-found", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("renders NotFoundPageView", async () => {
    const NotFoundPageViewMock = vi.fn(() => (
      <div data-testid="not-found-view">Not found</div>
    ));

    vi.doMock("@/views/not-found", () => ({
      NotFoundPageView: NotFoundPageViewMock,
    }));

    const { default: NotFound } = await import("@/app/not-found");
    render(<NotFound />);

    expect(NotFoundPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("not-found-view")).toHaveTextContent("Not found");
  });
});
