import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/challenges/loading", () => {
  it("renders challenge loading skeleton with expected blocks", async () => {
    const { default: ChallengesLoading } = await import("@/app/challenges/loading");

    const { container } = render(<ChallengesLoading />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("challenge-page");

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
    expect(container.querySelectorAll(".challenge-panel-soft")).toHaveLength(1);
    expect(container.querySelectorAll(".challenge-panel-muted")).toHaveLength(3);
  });
});

describe("app/challenges/page", () => {
  it("exposes stable metadata", async () => {
    const pageModule = await loadPageModule(
      () => import("@/app/challenges/page"),
      () => {
        vi.doMock("@/views/challenges/server", () => ({
          getChallengesPageData: vi.fn(),
        }));
        vi.doMock("@/views/challenges", () => ({
          ChallengesPageView: vi.fn(() => null),
        }));
      },
    );

    expect(pageModule.metadata).toEqual({
      title: "Challenges | CodeFight",
      description: "Solo coding practice problems for the CodeFight platform.",
    });
  });

  it("maps challenges data and computes solved/active counters", async () => {
    const pageData = {
      challenges: [
        { id: "c1", progress: "solved" },
        { id: "c2", progress: "in-progress" },
        { id: "c3", progress: "not-started" },
        { id: "c4", progress: "solved" },
      ],
      topics: [
        { name: "Arrays", count: 10 },
        { name: "SQL", count: 4 },
      ],
    };

    const getChallengesPageDataMock = vi.fn().mockResolvedValue(pageData);
    const ChallengesPageViewMock = vi.fn(
      ({ solvedCount, activeCount }: { solvedCount: number; activeCount: number }) => (
        <div data-testid="challenges-page-view">
          solved:{solvedCount};active:{activeCount}
        </div>
      ),
    );

    const { default: ChallengesPage } = await loadPageModule(
      () => import("@/app/challenges/page"),
      () => {
        vi.doMock("@/views/challenges/server", () => ({
          getChallengesPageData: getChallengesPageDataMock,
        }));
        vi.doMock("@/views/challenges", () => ({
          ChallengesPageView: ChallengesPageViewMock,
        }));
      },
    );
    const element = await ChallengesPage();

    render(element);

    expect(getChallengesPageDataMock).toHaveBeenCalledTimes(1);
    expect(ChallengesPageViewMock).toHaveBeenCalledTimes(1);

    const props = ChallengesPageViewMock.mock.calls[0]?.[0];
    expect(props).toMatchObject({
      challenges: pageData.challenges,
      topics: pageData.topics,
      solvedCount: 2,
      activeCount: 1,
    });

    expect(screen.getByTestId("challenges-page-view")).toHaveTextContent(
      "solved:2;active:1",
    );
  });
});
