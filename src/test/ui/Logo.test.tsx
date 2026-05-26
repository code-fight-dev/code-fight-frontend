import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { Logo } from "@/shared/ui/Logo";

describe("Logo", () => {
  it("renders default home link", () => {
    render(<Logo />);

    const link = screen.getByRole("link", { name: /arena/i });
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveTextContent("Arena.");
  });

  it("supports custom href and onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });

    render(<Logo href="/ranking" onClick={onClick} />);

    const link = screen.getByRole("link", { name: /arena/i });
    expect(link).toHaveAttribute("href", "/ranking");

    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
