import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  DifficultyLabel,
  MatchResultBadge,
  OpponentAvatar,
  ReplayLink,
} from "@/views/viewer-profile/ui/recent-matches/atoms";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    unoptimized,
    className,
    sizes,
  }: {
    src: string;
    alt: string;
    unoptimized?: boolean;
    className?: string;
    sizes?: string;
  }) => (
    <span
      role="img"
      aria-label={alt}
      className={className}
      data-src={src}
      data-sizes={sizes}
      data-unoptimized={String(Boolean(unoptimized))}
    />
  ),
}));

describe("views/viewer-profile/ui/recent-matches/atoms", () => {
  it("renders formatted result badge", () => {
    render(<MatchResultBadge result="cancelled" />);

    const badge = screen.getByText("Cancelled");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-amber-100");
  });

  it("renders opponent avatar image when avatar URL exists and fallback initial otherwise", () => {
    const { rerender } = render(
      <OpponentAvatar
        avatarUrl="https://cdn.example.com/opponent.png"
        username="alice"
      />,
    );

    const image = screen.getByRole("img", { name: "alice avatar" });
    expect(image).toHaveAttribute("data-src", "https://cdn.example.com/opponent.png");
    expect(image).toHaveAttribute("data-sizes", "40px");

    rerender(<OpponentAvatar avatarUrl="  " username="  @bob " />);
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("bypasses avatar optimization for data URLs", () => {
    render(<OpponentAvatar avatarUrl="data:image/png;base64,AAA=" username="kate" />);

    expect(screen.getByRole("img", { name: "kate avatar" })).toHaveAttribute(
      "data-unoptimized",
      "true",
    );
  });

  it("renders replay link href and width variant", () => {
    const { rerender } = render(<ReplayLink matchId="match-7" />);

    const replayLink = screen.getByRole("link", { name: "Open Replay" });
    expect(replayLink).toHaveAttribute("href", "/arena/replay/match-7");
    expect(replayLink).toHaveClass("w-auto");

    rerender(<ReplayLink matchId="match-7" fullWidth />);
    expect(screen.getByRole("link", { name: "Open Replay" })).toHaveClass("w-full");
  });

  it("renders known and unknown difficulty labels", () => {
    const { rerender } = render(<DifficultyLabel difficulty="hard" />);
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toHaveClass("challenge-difficulty-hard");

    rerender(<DifficultyLabel difficulty={null} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
