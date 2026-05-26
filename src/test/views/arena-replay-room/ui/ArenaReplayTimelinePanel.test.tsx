import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ArenaReplayTimelinePanel } from "@/views/arena-replay-room/ui/ArenaReplayTimelinePanel";

vi.mock("@/shared/ui/Select", () => ({
  Select: ({
    value,
    options,
    onValueChange,
    className,
    "aria-label": ariaLabel,
  }: {
    value: string;
    options: Array<{ value: string; label: string }>;
    onValueChange: (value: string) => void;
    className?: string;
    "aria-label"?: string;
  }) => (
    <select
      aria-label={ariaLabel}
      className={className}
      data-testid="replay-speed-select"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      <option value="9">9x (invalid)</option>
    </select>
  ),
}));

type Props = ComponentProps<typeof ArenaReplayTimelinePanel>;

function renderTimeline(overrides: Partial<Props> = {}) {
  const props: Props = {
    checkpoints: [
      {
        id: "cp-1",
        label: "Accepted run",
        tMs: 3000,
        verdict: "wrong_answer",
      },
      {
        id: "cp-2",
        label: "Final run",
        tMs: 65000,
      },
    ],
    currentCheckpointIndex: 1,
    currentTimeMs: 62000,
    durationMs: 65000,
    isPlaying: true,
    playbackSpeed: 1.5,
    onSeekToTime: vi.fn(),
    onSeekToCheckpoint: vi.fn(),
    onTogglePlayback: vi.fn(),
    onChangePlaybackSpeed: vi.fn(),
    ...overrides,
  };

  const result = render(<ArenaReplayTimelinePanel {...props} />);

  return {
    ...result,
    props,
  };
}

describe("views/arena-replay-room/ui/ArenaReplayTimelinePanel", () => {
  it("renders timeline controls, formats labels and triggers callbacks", () => {
    const { props } = renderTimeline();

    expect(
      screen.getByRole("heading", { name: "Timeline", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByText("01:02 / 01:05")).toBeInTheDocument();
    expect(screen.getByText("Accepted run - wrong answer")).toBeInTheDocument();
    expect(screen.getByText("00:03")).toBeInTheDocument();
    expect(screen.getByText("Final run")).toBeInTheDocument();
    expect(screen.getByText("01:05")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(props.onTogglePlayback).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByRole("slider"), { target: { value: "5000" } });
    expect(props.onSeekToTime).toHaveBeenCalledWith(5000);

    fireEvent.click(screen.getByText("Accepted run - wrong answer"));
    expect(props.onSeekToCheckpoint).toHaveBeenCalledWith(0);

    fireEvent.change(screen.getByTestId("replay-speed-select"), {
      target: { value: "2" },
    });
    expect(props.onChangePlaybackSpeed).toHaveBeenCalledWith(2);
  });

  it("clamps replay time values and falls back to default speed for unsupported values", () => {
    const { props } = renderTimeline({
      currentCheckpointIndex: 0,
      currentTimeMs: -1000,
      durationMs: -1,
      isPlaying: false,
      playbackSpeed: 9,
    });

    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("00:00 / 00:00")).toBeInTheDocument();

    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("max", "0");
    expect(slider).toHaveValue("0");

    expect(screen.getByTestId("replay-speed-select")).toHaveValue("1");

    fireEvent.change(screen.getByTestId("replay-speed-select"), {
      target: { value: "9" },
    });
    expect(props.onChangePlaybackSpeed).toHaveBeenCalledWith(1);
  });
});
