import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/about/page", () => {
  it("renders about page view", async () => {
    const AboutPageViewMock = vi.fn(() => (
      <div data-testid="about-page-view">about-content</div>
    ));

    const { default: AboutPage, metadata } = await loadPageModule(
      () => import("@/app/about/page"),
      () => {
        vi.doMock("@/views/company", () => ({
          AboutPageView: AboutPageViewMock,
        }));
      },
    );

    const element = AboutPage();
    render(element);

    expect(AboutPageViewMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("about-page-view")).toHaveTextContent("about-content");
    expect(metadata).toMatchObject({
      title: "About | CodeFight",
    });
  });
});
