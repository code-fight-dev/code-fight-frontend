import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/not-found", () => {
  it("renders NotFoundPageView", async () => {
    const NotFoundPageViewMock = vi.fn(() => (
      <div data-testid="not-found-view">Not found</div>
    ));

    const { default: NotFound } = await loadPageModule(
      () => import("@/app/not-found"),
      () => {
        vi.doMock("@/views/not-found", () => ({
          NotFoundPageView: NotFoundPageViewMock,
        }));
      },
    );
    render(<NotFound />);

    expect(NotFoundPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("not-found-view")).toHaveTextContent("Not found");
  });
});
