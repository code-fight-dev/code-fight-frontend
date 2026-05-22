"use client";

import type { MatchReplayCheckpoint } from "@/features/match-replay";
import { cn } from "@/shared/lib/cn";
import { Select, type SelectOption } from "@/shared/ui/Select";

type Props = {
  checkpoints: MatchReplayCheckpoint[];
  currentCheckpointIndex: number;
  currentTimeMs: number;
  durationMs: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onSeekToTime: (timeMs: number) => void;
  onSeekToCheckpoint: (index: number) => void;
  onTogglePlayback: () => void;
  onChangePlaybackSpeed: (value: number) => void;
};

const SPEED_PRESETS = [0.75, 1, 1.5, 2, 3] as const;
type ReplaySpeedPreset = (typeof SPEED_PRESETS)[number];
type ReplaySpeedValue = `${ReplaySpeedPreset}`;

const DEFAULT_REPLAY_SPEED: ReplaySpeedPreset = 1;

const SPEED_OPTIONS: SelectOption<ReplaySpeedValue>[] = SPEED_PRESETS.map((speed) => ({
  value: `${speed}` as ReplaySpeedValue,
  label: `${speed}x`,
}));

function toReplaySpeedValue(speed: number): ReplaySpeedValue {
  const preset =
    SPEED_PRESETS.find((candidate) => candidate === speed) ?? DEFAULT_REPLAY_SPEED;

  return `${preset}` as ReplaySpeedValue;
}

function parseReplaySpeedValue(value: ReplaySpeedValue): ReplaySpeedPreset {
  const parsed = Number(value);
  const preset = SPEED_PRESETS.find((candidate) => candidate === parsed);

  return preset ?? DEFAULT_REPLAY_SPEED;
}

function formatReplayTime(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatLabel(checkpoint: MatchReplayCheckpoint) {
  const verdict = checkpoint.verdict?.replaceAll("_", " ");
  if (!verdict) {
    return checkpoint.label;
  }

  return `${checkpoint.label} - ${verdict}`;
}

export function ArenaReplayTimelinePanel({
  checkpoints,
  currentCheckpointIndex,
  currentTimeMs,
  durationMs,
  isPlaying,
  playbackSpeed,
  onSeekToTime,
  onSeekToCheckpoint,
  onTogglePlayback,
  onChangePlaybackSpeed,
}: Props) {
  const maxDurationMs = Math.max(0, durationMs);
  const safeCurrentTimeMs = Math.min(Math.max(currentTimeMs, 0), maxDurationMs);
  const playbackSpeedValue = toReplaySpeedValue(playbackSpeed);

  return (
    <section className="challenge-panel flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(14,22,42,0.95),rgba(9,14,29,0.92))]">
      <div className="challenge-panel-header border-b border-(--app-option-border) p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[14px] font-semibold text-(--app-text-strong)">Timeline</h3>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlayback}
              className="challenge-focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-blue-400/32 bg-blue-500/12 px-3 text-[12px] font-semibold text-blue-100 transition-colors hover:border-blue-300/45 hover:bg-blue-500/18"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <Select
              aria-label="Playback speed"
              value={playbackSpeedValue}
              options={SPEED_OPTIONS}
              onValueChange={(value) =>
                onChangePlaybackSpeed(parseReplaySpeedValue(value))
              }
              surface="challenge"
              controlSize="sm"
              className="w-22 text-[12px]"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={maxDurationMs}
            step={100}
            value={safeCurrentTimeMs}
            onChange={(event) => onSeekToTime(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer accent-blue-300"
          />
          <span className="min-w-20 text-right text-[12px] text-(--app-text-faint)">
            {formatReplayTime(safeCurrentTimeMs)} / {formatReplayTime(maxDurationMs)}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="space-y-2">
          {checkpoints.map((checkpoint, index) => (
            <button
              key={checkpoint.id}
              type="button"
              onClick={() => onSeekToCheckpoint(index)}
              className={cn(
                "challenge-focus-ring flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors",
                index === currentCheckpointIndex
                  ? "border-blue-400/30 bg-blue-500/10"
                  : "border-white/10 bg-white/4 hover:border-blue-400/20 hover:bg-blue-500/7",
              )}
            >
              <span className="min-w-0 truncate text-[12px] text-(--app-text-soft)">
                {formatLabel(checkpoint)}
              </span>
              <span className="ml-3 shrink-0 text-[11px] text-(--app-text-faint)">
                {formatReplayTime(checkpoint.tMs)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
