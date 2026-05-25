import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { loadPageModule } from "@/test/app/test-helpers/page-module";

function createViewer(username: string) {
  return {
    id: `viewer-${username}`,
    username,
    email: `${username}@example.com`,
    createdAt: "2026-05-24T12:00:00.000Z",
  };
}

describe("app/challenges/layout", () => {
  it("redirects guests to sign in", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(null);

    const { default: ChallengesLayout } = await loadPageModule(
      () => import("@/app/challenges/layout"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
      },
    );

    await expect(
      ChallengesLayout({
        children: <div>Challenges content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("returns children for authenticated viewer", async () => {
    const redirectMock = vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    });
    const getCurrentViewerServerMock = vi.fn().mockResolvedValue(createViewer("alice"));

    const { default: ChallengesLayout } = await loadPageModule(
      () => import("@/app/challenges/layout"),
      () => {
        vi.doMock("next/navigation", () => ({
          redirect: redirectMock,
        }));
        vi.doMock("@/entities/viewer/server", () => ({
          getCurrentViewerServer: getCurrentViewerServerMock,
        }));
      },
    );

    const element = await ChallengesLayout({
      children: <div>Challenges content</div>,
    });

    render(<>{element}</>);

    expect(screen.getByText("Challenges content")).toBeInTheDocument();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
