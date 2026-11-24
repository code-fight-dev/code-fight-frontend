import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { getNotifications, markNotificationsRead } from "@/features/notifications/api";

vi.mock("@/features/notifications/api", () => ({
  getNotifications: vi.fn(),
  markNotificationsRead: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

test("refreshes the signed-in inbox on an event and keeps read notifications in history", async () => {
  const stream = new EventTarget();
  const close = vi.fn();
  vi.stubGlobal(
    "EventSource",
    class {
      addEventListener = stream.addEventListener.bind(stream);
      close = close;
    },
  );
  const item = {
    id: "notice-1",
    kind: "tournament.match_scheduled",
    title: "Tournament match scheduled",
    message: "Local cup · Opponent: alex",
    href: "/arena/match/match-1",
    createdAt: "2026-11-24T19:00:00Z",
    deadlineAt: "2026-11-24T19:15:00Z",
    readAt: null,
  };
  const page = { items: [item], unread: 1, nextCursor: null };
  const get = vi.mocked(getNotifications);
  get.mockResolvedValue({ items: [], unread: 0, nextCursor: null });
  const unmount = render(<NotificationBell />).unmount;
  await waitFor(() => expect(get).toHaveBeenCalled());

  get.mockImplementation(async () => page);
  act(() => {
    stream.dispatchEvent(new Event("notifications.changed"));
  });
  const bell = await screen.findByRole("button", { name: "Notifications, 1 unread" });
  const user = userEvent.setup();
  await user.click(bell);
  expect(
    await screen.findByRole("link", { name: /Tournament match scheduled/ }),
  ).toHaveAttribute("href", item.href);
  expect(screen.getByText(/Ready by/)).toBeInTheDocument();

  vi.mocked(markNotificationsRead).mockImplementation(async () => {
    get.mockResolvedValue({
      unread: 0,
      nextCursor: null,
      items: [{ ...item, readAt: "2026-11-24T19:01:00Z" }],
    });
  });
  await user.click(screen.getByRole("button", { name: "Mark all as read" }));
  await waitFor(() => expect(markNotificationsRead).toHaveBeenCalledWith(undefined));
  expect(
    await screen.findByRole("button", { name: "Notifications" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Tournament match scheduled/ }),
  ).toBeInTheDocument();
  unmount();
  expect(close).toHaveBeenCalledOnce();
});
