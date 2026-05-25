import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeaderboardAvatar } from "@/entities/leaderboard";

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    sizes,
    src,
  }: {
    alt: string;
    className?: string;
    sizes?: string;
    src: string;
  }) => (
    <span
      role="img"
      aria-label={alt}
      className={className}
      data-sizes={sizes}
      data-src={src}
    />
  ),
}));

describe("LeaderboardAvatar", () => {
  it("renders fallback initial when avatar url is empty", () => {
    render(
      <LeaderboardAvatar
        avatarUrl="   "
        username="  @alice  "
        imageSize={36}
        className="rounded-xl"
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders avatar image when avatar url is present", () => {
    render(
      <LeaderboardAvatar
        avatarUrl="https://example.com/avatar.png"
        username="alice"
        imageSize={40}
      />,
    );

    const image = screen.getByRole("img", { name: "alice avatar" });
    expect(image).toHaveAttribute("data-src", "https://example.com/avatar.png");
    expect(image).toHaveAttribute("data-sizes", "40px");
    expect(image).toHaveClass("object-cover");
  });

  it("merges base and custom classes on wrapper", () => {
    const { container } = render(
      <LeaderboardAvatar
        avatarUrl=""
        username="alice"
        imageSize={36}
        className="h-9 w-9 rounded-xl"
      />,
    );

    const wrapper = container.querySelector("span");
    expect(wrapper).toHaveClass("relative");
    expect(wrapper).toHaveClass("inline-flex");
    expect(wrapper).toHaveClass("h-9");
    expect(wrapper).toHaveClass("w-9");
    expect(wrapper).toHaveClass("rounded-xl");
  });
});
