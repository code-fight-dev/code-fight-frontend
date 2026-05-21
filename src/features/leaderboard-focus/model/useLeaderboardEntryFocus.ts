"use client";

import { useEffect, useRef, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const FOCUS_DURATION_MS = 2200;
const MAX_SCROLL_ATTEMPTS = 40;
const SCROLL_RETRY_DELAY_MS = 120;

type Options = {
  goToEntry: (userId: string) => boolean;
  viewerUserId: string | null;
};

export function useLeaderboardEntryFocus({ goToEntry, viewerUserId }: Options) {
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const focusTimeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (focusTimeoutIdRef.current !== null) {
        window.clearTimeout(focusTimeoutIdRef.current);
      }
    };
  }, []);

  function scheduleFocus(userId: string) {
    if (focusTimeoutIdRef.current !== null) {
      window.clearTimeout(focusTimeoutIdRef.current);
    }

    setFocusedUserId(userId);

    focusTimeoutIdRef.current = window.setTimeout(() => {
      setFocusedUserId((currentUserId) =>
        currentUserId === userId ? null : currentUserId,
      );
      focusTimeoutIdRef.current = null;
    }, FOCUS_DURATION_MS);
  }

  function scrollToUserEntry(userId: string, attempt = 0) {
    const isDesktop = window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
    const elementId = isDesktop
      ? `leaderboard-entry-desktop-${userId}`
      : `leaderboard-entry-mobile-${userId}`;

    const targetElement = document.getElementById(elementId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      scheduleFocus(userId);
      return;
    }

    if (attempt >= MAX_SCROLL_ATTEMPTS) {
      return;
    }

    window.setTimeout(() => {
      scrollToUserEntry(userId, attempt + 1);
    }, SCROLL_RETRY_DELAY_MS);
  }

  function queueScrollToUserEntry(userId: string) {
    window.setTimeout(() => {
      scrollToUserEntry(userId);
    }, 0);
  }

  function handleJumpToMe() {
    if (!viewerUserId) {
      return;
    }

    if (!goToEntry(viewerUserId)) {
      return;
    }

    queueScrollToUserEntry(viewerUserId);
  }

  return {
    focusedUserId,
    handleJumpToMe,
  };
}
