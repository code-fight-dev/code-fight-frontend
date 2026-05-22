"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_PLAYBACK_SPEED } from "./constants";

type Params = {
  isPlaying: boolean;
  durationMs: number;
  safeCurrentTimeMs: number;
  playbackSpeed: number;
  setCurrentTimeMs: (value: number) => void;
  setIsPlaying: (value: boolean) => void;
};

export function useReplayClock({
  isPlaying,
  durationMs,
  safeCurrentTimeMs,
  playbackSpeed,
  setCurrentTimeMs,
  setIsPlaying,
}: Params) {
  const playbackClockRef = useRef<{
    currentTimeMs: number;
    lastFrameAt: number;
  } | null>(null);
  const playbackSpeedRef = useRef(DEFAULT_PLAYBACK_SPEED);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    currentTimeRef.current = safeCurrentTimeMs;
  }, [safeCurrentTimeMs]);

  useEffect(() => {
    if (!isPlaying) {
      playbackClockRef.current = null;
      return;
    }

    if (durationMs <= 0) {
      playbackClockRef.current = null;
      return;
    }

    const initialTimeMs =
      currentTimeRef.current >= durationMs ? 0 : currentTimeRef.current;

    playbackClockRef.current = {
      currentTimeMs: initialTimeMs,
      lastFrameAt: 0,
    };

    let rafId = 0;

    const tick = (now: number) => {
      const clock = playbackClockRef.current;
      if (!clock) {
        return;
      }

      if (clock.lastFrameAt <= 0) {
        clock.lastFrameAt = now;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      const frameDeltaMs = now - clock.lastFrameAt;
      clock.lastFrameAt = now;
      const nextTimeMs = Math.min(
        durationMs,
        clock.currentTimeMs + frameDeltaMs * playbackSpeedRef.current,
      );
      clock.currentTimeMs = nextTimeMs;

      setCurrentTimeMs(nextTimeMs);

      if (nextTimeMs >= durationMs) {
        setIsPlaying(false);
        playbackClockRef.current = null;
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [durationMs, isPlaying, setCurrentTimeMs, setIsPlaying]);
}
