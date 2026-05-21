import "server-only";

import { API_BASE_URL } from "@/shared/config/api";
import type { PublicMatchStats } from "../model/types";

const PUBLIC_MATCH_STATS_REVALIDATE_SECONDS = 30;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isPublicMatchStats(value: unknown): value is PublicMatchStats {
  return (
    isRecord(value) &&
    isFiniteNumber(value.queuedPlayers) &&
    isFiniteNumber(value.activeMatchPlayers) &&
    typeof value.cachedAt === "string" &&
    value.cachedAt.trim() !== ""
  );
}

export async function getPublicMatchStats(): Promise<PublicMatchStats> {
  const response = await fetch(`${API_BASE_URL}/api/matches/stats`, {
    method: "GET",
    next: { revalidate: PUBLIC_MATCH_STATS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public match stats");
  }

  const body = (await response.json().catch(() => null)) as unknown;
  if (!isPublicMatchStats(body)) {
    throw new Error("Invalid public match stats response");
  }

  return body;
}
