import "server-only";

import { headers } from "next/headers";
import { API_BASE_URL } from "@/shared/config/api";
import { isLeaderboardPage } from "../model/types";
import type { LeaderboardPage } from "../model/types";

type GetLeaderboardPageOptions = {
  mode?: string;
  limit?: number;
  offset?: number;
};

function toQueryString({ mode, limit, offset }: GetLeaderboardPageOptions) {
  const query = new URLSearchParams();

  if (mode && mode.trim() !== "") {
    query.set("mode", mode.trim());
  }
  if (typeof limit === "number") {
    query.set("limit", String(limit));
  }
  if (typeof offset === "number") {
    query.set("offset", String(offset));
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getLeaderboardPage(
  options: GetLeaderboardPageOptions = {},
): Promise<LeaderboardPage> {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");
  const response = await fetch(
    `${API_BASE_URL}/api/leaderboard${toQueryString(options)}`,
    {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  const body = (await response.json().catch(() => null)) as unknown;
  if (!isLeaderboardPage(body)) {
    throw new Error("Invalid leaderboard response");
  }

  return body;
}
