import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArenaQueueSettingsCard } from "@/views/arena/ui/ArenaQueueSettingsCard";

describe("views/arena/ui/ArenaQueueSettingsCard", () => {
  it("updates difficulty and rated mode while unlocked", () => {
    const setTaskMode = vi.fn();
    const setIsRated = vi.fn();

    render(
      <ArenaQueueSettingsCard
        queueSettings={{ taskMode: "normal", isRated: true }}
        isLocked={false}
        setTaskMode={setTaskMode}
        setIsRated={setIsRated}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Normal" }));
    expect(setTaskMode).toHaveBeenCalledWith("normal");

    fireEvent.click(screen.getByRole("button", { name: "Hard" }));
    expect(setTaskMode).toHaveBeenCalledWith("hard");

    const ratedSwitch = screen.getByRole("button", { pressed: true });
    fireEvent.click(ratedSwitch);
    expect(setIsRated).toHaveBeenCalledWith(false);
  });

  it("disables controls while settings are locked", () => {
    const setTaskMode = vi.fn();
    const setIsRated = vi.fn();

    render(
      <ArenaQueueSettingsCard
        queueSettings={{ taskMode: "hard", isRated: false }}
        isLocked
        setTaskMode={setTaskMode}
        setIsRated={setIsRated}
      />,
    );

    const normalButton = screen.getByRole("button", { name: "Normal" });
    const hardButton = screen.getByRole("button", { name: "Hard" });
    const ratedSwitch = screen.getByRole("button", { pressed: false });

    expect(normalButton).toBeDisabled();
    expect(hardButton).toBeDisabled();
    expect(ratedSwitch).toBeDisabled();

    fireEvent.click(normalButton);
    fireEvent.click(ratedSwitch);
    expect(setTaskMode).not.toHaveBeenCalled();
    expect(setIsRated).not.toHaveBeenCalled();
  });
});
