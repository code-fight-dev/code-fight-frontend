"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { API_BASE_URL } from "@/shared/config/api";
import { IconButton } from "@/shared/ui/IconButton";
import { getNotifications, markNotificationsRead, type NotificationPage } from "./api";

function displayTime(value: string, includeZone = false) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(includeZone && { timeZoneName: "short" }),
  }).format(new Date(value));
}

export function NotificationBell() {
  const regionId = useId();
  const root = useRef<HTMLDivElement>(null);
  const active = useRef<AbortController | null>(null);
  const mutation = useRef(false);
  const [page, setPage] = useState<NotificationPage | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async (before?: string) => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    try {
      const next = await getNotifications(controller.signal, before);
      if (controller.signal.aborted) return;
      setError("");
      setPage((current) =>
        before && current?.nextCursor === before
          ? { ...next, items: [...current.items, ...next.items] }
          : next,
      );
    } catch {
      if (!controller.signal.aborted)
        setError("Could not load notifications. Try refreshing.");
    } finally {
      if (active.current === controller) active.current = null;
    }
  }, []);

  useEffect(() => {
    const update = () => {
      if (!mutation.current) void refresh();
    };
    update();
    const source =
      typeof EventSource === "undefined"
        ? null
        : new EventSource(API_BASE_URL + "/api/events", { withCredentials: true });
    source?.addEventListener("connected", update);
    source?.addEventListener("notifications.changed", update);
    window.addEventListener("focus", update);
    // The database history also catches events missed during a disconnection.
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !active.current) update();
    }, 30000);
    return () => {
      source?.close();
      window.removeEventListener("focus", update);
      window.clearInterval(timer);
      active.current?.abort();
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const dismiss = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector("button")?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", dismiss);
    };
  }, [open]);

  async function markRead(id?: string) {
    if (mutation.current) return;
    mutation.current = true;
    setBusy(true);
    try {
      await markNotificationsRead(id);
      await refresh();
    } catch {
      setError("Could not mark notifications as read. Try again.");
    } finally {
      setBusy(false);
      mutation.current = false;
    }
  }

  const unread = page?.unread ?? 0;
  return (
    <div ref={root} className="relative shrink-0">
      <IconButton
        aria-label={unread ? "Notifications, " + unread + " unread" : "Notifications"}
        aria-expanded={open}
        aria-controls={open ? regionId : undefined}
        className="relative flex size-10 items-center justify-center rounded-xl border border-(--app-control-secondary-border) bg-(--app-control-secondary-bg) text-(--app-text-strong)"
        onClick={() => {
          setOpen(!open);
          if (!open && !mutation.current) void refresh();
        }}
      >
        <Bell aria-hidden="true" size={19} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 min-w-4 rounded-full bg-blue-500 px-0.5 text-center text-[10px] text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </IconButton>
      <span className="sr-only" aria-live="polite">
        {unread ? unread + " unread notifications" : ""}
      </span>
      {open && (
        <section
          id={regionId}
          aria-label="Notifications"
          className="app-surface fixed top-20 right-3 z-20 w-[min(23rem,calc(100vw-1.5rem))] rounded-2xl border border-(--app-control-secondary-border) text-(--app-text-strong) shadow-xl sm:absolute sm:top-full sm:right-0 sm:mt-3"
        >
          <div className="flex items-center justify-between gap-2 border-b border-(--app-control-secondary-border) p-4">
            <h2 className="font-semibold">Notifications</h2>
            {unread > 0 && (
              <button
                className="text-sm underline disabled:opacity-50"
                disabled={busy}
                onClick={() => void markRead()}
              >
                Mark all as read
              </button>
            )}
          </div>
          {error && (
            <p className="px-4 pt-3 text-sm" role="alert">
              {error}{" "}
              <button className="underline" onClick={() => void refresh()}>
                Refresh
              </button>
            </p>
          )}
          {!page && !error && <p className="p-4 text-sm">Loading notifications…</p>}
          {page?.items.length === 0 && (
            <p className="p-4 text-sm">No notifications yet.</p>
          )}
          <ul className="max-h-[min(27rem,65vh)] overflow-auto">
            {page?.items.map((item) => (
              <li
                key={item.id}
                className="border-b border-(--app-control-secondary-border) last:border-b-0"
              >
                <Link
                  href={item.href}
                  className="block space-y-1 p-4 hover:bg-blue-500/10"
                  onClick={() => {
                    setOpen(false);
                    if (item.readAt === null) void markRead(item.id);
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={item.readAt === null ? "font-semibold" : ""}>
                      {item.readAt === null && <span className="sr-only">Unread: </span>}
                      {item.title}
                    </span>
                    <time
                      className="shrink-0 text-xs text-(--app-text-soft)"
                      dateTime={item.createdAt}
                    >
                      {displayTime(item.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm">{item.message}</p>
                  {item.deadlineAt && (
                    <p className="text-xs text-(--app-text-soft)">
                      Ready by{" "}
                      <time dateTime={item.deadlineAt}>
                        {displayTime(item.deadlineAt, true)}
                      </time>
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {page?.nextCursor && (
            <button
              className="w-full p-3 text-sm underline"
              disabled={busy}
              onClick={() => void refresh(page.nextCursor ?? undefined)}
            >
              Load older notifications
            </button>
          )}
        </section>
      )}
    </div>
  );
}
