import { afterEach, describe, expect, it, vi } from "vitest";

import { getPublicMatchStats } from "@/entities/match/server";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("match server api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns public match stats and uses revalidate option", async () => {
    const stats = {
      queuedPlayers: 12,
      activeMatchPlayers: 34,
      cachedAt: "2026-05-24T12:00:00.000Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(stats));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPublicMatchStats();

    expect(result).toEqual(stats);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/matches/stats"),
      {
        method: "GET",
        next: {
          revalidate: 30,
        },
      },
    );
  });

  it("throws when stats request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicMatchStats()).rejects.toThrow(
      "Failed to fetch public match stats",
    );
  });

  it("throws when stats response is malformed json", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("broken", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicMatchStats()).rejects.toThrow(
      "Invalid public match stats response",
    );
  });

  it("throws when stats response shape is invalid", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          queuedPlayers: "12",
          activeMatchPlayers: 34,
          cachedAt: "2026-05-24T12:00:00.000Z",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          queuedPlayers: 12,
          activeMatchPlayers: Number.NaN,
          cachedAt: "2026-05-24T12:00:00.000Z",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          queuedPlayers: 12,
          activeMatchPlayers: 34,
          cachedAt: "   ",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          queuedPlayers: 12,
          activeMatchPlayers: 34,
        }),
      )
      .mockResolvedValueOnce(jsonResponse(null));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicMatchStats()).rejects.toThrow(
      "Invalid public match stats response",
    );
    await expect(getPublicMatchStats()).rejects.toThrow(
      "Invalid public match stats response",
    );
    await expect(getPublicMatchStats()).rejects.toThrow(
      "Invalid public match stats response",
    );
    await expect(getPublicMatchStats()).rejects.toThrow(
      "Invalid public match stats response",
    );
    await expect(getPublicMatchStats()).rejects.toThrow(
      "Invalid public match stats response",
    );
  });
});
