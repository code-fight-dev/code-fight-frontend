import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundActions } from "@/views/not-found/ui/NotFoundActions";

const notFoundActionsMocks = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: notFoundActionsMocks.back,
    push: notFoundActionsMocks.push,
  }),
}));

describe("views/not-found/ui/NotFoundActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders home link and pushes home when history length is 1", async () => {
    const user = userEvent.setup();

    render(<NotFoundActions />);

    const homeLink = screen.getByRole("link", { name: "Return Home" });
    expect(homeLink).toHaveAttribute("href", "/");

    await user.click(screen.getByRole("button", { name: "Go Back" }));

    expect(notFoundActionsMocks.back).not.toHaveBeenCalled();
    expect(notFoundActionsMocks.push).toHaveBeenCalledWith("/");
  });

  it("goes back when browser history has previous entries", async () => {
    const user = userEvent.setup();

    window.history.pushState({}, "", "/temp-not-found-history-entry");
    render(<NotFoundActions />);

    await user.click(screen.getByRole("button", { name: "Go Back" }));

    expect(window.history.length).toBeGreaterThan(1);
    expect(notFoundActionsMocks.back).toHaveBeenCalledTimes(1);
  });
});
