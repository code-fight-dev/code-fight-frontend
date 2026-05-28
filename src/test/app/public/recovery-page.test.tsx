import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/recovery/page", () => {
  it("renders recovery page view", async () => {
    const RecoveryPageViewMock = vi.fn(() => (
      <div data-testid="recovery-page-view">recovery-content</div>
    ));

    const { default: RecoveryPage, metadata } = await loadPageModule(
      () => import("@/app/recovery/page"),
      () => {
        vi.doMock("@/views/recovery", () => ({
          RecoveryPageView: RecoveryPageViewMock,
        }));
      },
    );

    const element = RecoveryPage();
    render(element);

    expect(RecoveryPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("recovery-page-view")).toHaveTextContent(
      "recovery-content",
    );

    expect(metadata).toMatchObject({
      title: "Password Recovery | CodeFight",
      description: "Recover access to your CodeFight account.",
      alternates: {
        canonical: "/recovery",
      },
      robots: {
        index: false,
        follow: false,
      },
    });
  });
});
