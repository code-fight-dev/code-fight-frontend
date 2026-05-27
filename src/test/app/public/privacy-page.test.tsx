import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/privacy/page", () => {
  it("renders privacy page view", async () => {
    const PrivacyPageViewMock = vi.fn(() => (
      <div data-testid="privacy-page-view">privacy-content</div>
    ));

    const { default: PrivacyPage, metadata } = await loadPageModule(
      () => import("@/app/privacy/page"),
      () => {
        vi.doMock("@/views/company", () => ({
          PrivacyPageView: PrivacyPageViewMock,
        }));
      },
    );

    const element = PrivacyPage();
    render(element);

    expect(PrivacyPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("privacy-page-view")).toHaveTextContent("privacy-content");
    expect(metadata).toMatchObject({
      title: "Privacy | CodeFight",
    });
  });
});
