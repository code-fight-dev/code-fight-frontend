import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { StatusPageHero } from "@/views/status/ui/StatusPageHero";

describe("views/status/ui/StatusPageHero", () => {
  beforeEach(() => {
    document.documentElement.dataset.motion = "disabled";
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-motion");
  });

  it("renders status page hero copy", () => {
    render(<StatusPageHero />);

    expect(screen.getByText("System status")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "CodeFight Status", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Live availability information for CodeFight core services."),
    ).toBeInTheDocument();
  });
});
