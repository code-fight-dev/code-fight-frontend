import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getFirstCallProps, loadPageModule } from "@/test/app/test-helpers/page-module";

describe("app/challenges/[slug]/page", () => {
  it("returns fallback metadata when challenge does not exist", async () => {
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(null);

    const { generateMetadata } = await loadPageModule(
      () => import("@/app/challenges/[slug]/page"),
      () => {
        vi.doMock("@/views/challenges/server", () => ({
          getChallengeBySlug: getChallengeBySlugMock,
        }));
        vi.doMock("@/views/challenges", () => ({
          ChallengeWorkspace: () => <div>workspace</div>,
        }));
        vi.doMock("next/navigation", () => ({
          notFound: vi.fn(() => {
            throw new Error("NEXT_NOT_FOUND");
          }),
        }));
      },
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "missing-slug" }),
    });

    expect(getChallengeBySlugMock).toHaveBeenCalledWith("missing-slug");
    expect(metadata).toEqual({
      title: "Challenge not found | CodeFight",
    });
  });

  it("returns challenge metadata when challenge exists", async () => {
    const challenge = {
      slug: "two-sum",
      title: "Two Sum",
      summary: "Find two numbers that sum to target.",
    };
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(challenge);

    const { generateMetadata } = await loadPageModule(
      () => import("@/app/challenges/[slug]/page"),
      () => {
        vi.doMock("@/views/challenges/server", () => ({
          getChallengeBySlug: getChallengeBySlugMock,
        }));
        vi.doMock("@/views/challenges", () => ({
          ChallengeWorkspace: () => <div>workspace</div>,
        }));
        vi.doMock("next/navigation", () => ({
          notFound: vi.fn(() => {
            throw new Error("NEXT_NOT_FOUND");
          }),
        }));
      },
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "two-sum" }),
    });

    expect(metadata).toEqual({
      title: "Two Sum | CodeFight Challenges",
      description: "Find two numbers that sum to target.",
      alternates: {
        canonical: "/challenges/two-sum",
      },
    });
  });

  it("calls notFound when challenge is missing", async () => {
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(null);
    const ChallengeWorkspaceMock = vi.fn(({ challenge }: { challenge: unknown }) => (
      <div>{JSON.stringify(challenge)}</div>
    ));

    const { default: ChallengeDetailPage } = await loadPageModule(
      () => import("@/app/challenges/[slug]/page"),
      () => {
        vi.doMock("@/views/challenges/server", () => ({
          getChallengeBySlug: getChallengeBySlugMock,
        }));
        vi.doMock("@/views/challenges", () => ({
          ChallengeWorkspace: ChallengeWorkspaceMock,
        }));
        vi.doMock("next/navigation", () => ({
          notFound: notFoundMock,
        }));
      },
    );

    await expect(
      ChallengeDetailPage({
        params: Promise.resolve({ slug: "missing-slug" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
    expect(ChallengeWorkspaceMock).not.toHaveBeenCalled();
  });

  it("renders workspace with challenge data", async () => {
    const challenge = {
      slug: "two-sum",
      title: "Two Sum",
      summary: "Find two numbers that sum to target.",
    };
    const notFoundMock = vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
    const getChallengeBySlugMock = vi.fn().mockResolvedValue(challenge);
    const ChallengeWorkspaceMock = vi.fn(
      ({ challenge: value }: { challenge: unknown }) => (
        <div data-testid="challenge-workspace">{JSON.stringify(value)}</div>
      ),
    );

    const { default: ChallengeDetailPage } = await loadPageModule(
      () => import("@/app/challenges/[slug]/page"),
      () => {
        vi.doMock("@/views/challenges/server", () => ({
          getChallengeBySlug: getChallengeBySlugMock,
        }));
        vi.doMock("@/views/challenges", () => ({
          ChallengeWorkspace: ChallengeWorkspaceMock,
        }));
        vi.doMock("next/navigation", () => ({
          notFound: notFoundMock,
        }));
      },
    );
    const element = await ChallengeDetailPage({
      params: Promise.resolve({ slug: "two-sum" }),
    });

    render(element);

    expect(getFirstCallProps(ChallengeWorkspaceMock)).toEqual({
      challenge,
    });
    expect(screen.getByTestId("challenge-workspace")).toHaveTextContent(
      '"slug":"two-sum"',
    );
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
