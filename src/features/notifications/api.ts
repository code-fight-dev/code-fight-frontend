import { isRecord, managementRequest } from "@/shared/api/management";

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  message: string;
  href: string;
  deadlineAt: string | null;
  createdAt: string;
  readAt: string | null;
};

export type NotificationPage = {
  items: NotificationItem[];
  unread: number;
  nextCursor: string | null;
};

function isDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isNotification(value: unknown): value is NotificationItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.kind === "string" &&
    typeof value.title === "string" &&
    typeof value.message === "string" &&
    typeof value.href === "string" &&
    value.href.startsWith("/") &&
    !value.href.startsWith("//") &&
    !value.href.includes("\\") &&
    isDate(value.createdAt) &&
    (value.deadlineAt === null || isDate(value.deadlineAt)) &&
    (value.readAt === null || isDate(value.readAt))
  );
}

export async function getNotifications(
  signal?: AbortSignal,
  before?: string,
): Promise<NotificationPage> {
  const query = before ? "?before=" + encodeURIComponent(before) : "";
  const data = await managementRequest("/notifications" + query, { signal });
  if (
    !isRecord(data) ||
    !Array.isArray(data.items) ||
    !data.items.every(isNotification) ||
    typeof data.unread !== "number" ||
    (data.nextCursor !== null && typeof data.nextCursor !== "string")
  ) {
    throw new Error("Invalid notification response");
  }
  return { items: data.items, unread: data.unread, nextCursor: data.nextCursor };
}

export function markNotificationsRead(id?: string) {
  const member = id ? "/" + encodeURIComponent(id) : "";
  return managementRequest("/notifications" + member + "/read", { method: "POST" });
}
