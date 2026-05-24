import { afterEach, describe, expect, it, vi } from "vitest";

import type { UpdateViewerProfileInput, ViewerProfile } from "@/entities/viewer";
import {
  getViewerProfile,
  updateViewerAvatar,
  updateViewerProfile,
} from "@/entities/viewer";

function createViewerProfile(username = "alice"): ViewerProfile {
  return {
    id: `viewer-${username}`,
    username,
    displayName: "Alice",
    bio: "Practicing algorithms",
    country: "United States",
    countryCode: "US",
    stateProvince: "CA",
    city: "San Francisco",
    avatarUrl: "https://example.com/avatar.png",
    providerAvatarUrl: "https://example.com/provider-avatar.png",
    avatarSource: "custom",
    authProvider: "github",
    createdAt: "2026-05-24T12:00:00.000Z",
    stats: {
      eloRating: 1500,
      globalRank: 100,
      globalPlayersCount: 2000,
      regionalRank: 12,
      regionalPlayersCount: 500,
      winRate: 66.7,
      totalMatches: 30,
      wins: 20,
      losses: 8,
      draws: 2,
      avgSolutionTimeSeconds: 120,
      maxWinStreak: 5,
    },
    eloHistory: [
      {
        date: "2026-05-23",
        delta: 16,
        rating: 1500,
        matchesPlayed: 30,
      },
    ],
    topLanguages: [
      {
        name: "TypeScript",
        usageShare: 0.75,
      },
    ],
    recentMatches: [
      {
        id: "match-1",
        result: "win",
        opponent: {
          id: "viewer-bob",
          username: "bob",
          displayName: "Bob",
          avatarUrl: "https://example.com/bob.png",
        },
        difficulty: "medium",
        eloDelta: 16,
        isRated: true,
        finishedAt: "2026-05-23T12:00:00.000Z",
      },
    ],
  };
}

function createProfileResponse(profile: ViewerProfile, status = 200) {
  return new Response(JSON.stringify({ profile }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("viewer profile api", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches profile by username and returns parsed profile", async () => {
    const profile = createViewerProfile();
    const fetchMock = vi.fn().mockResolvedValue(createProfileResponse(profile));
    vi.stubGlobal("fetch", fetchMock);

    const result = await getViewerProfile("alice smith");

    expect(result).toEqual(profile);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/users/alice%20smith"),
      {
        method: "GET",
        cache: "no-store",
      },
    );
  });

  it("returns null when profile is not found", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getViewerProfile("ghost")).resolves.toBeNull();
  });

  it("throws when profile request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getViewerProfile("alice")).rejects.toThrow("Failed to fetch profile");
  });

  it("throws when profile response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ profile: { id: "broken" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getViewerProfile("alice")).rejects.toThrow("Invalid profile response");
  });

  it("throws when profile response JSON is malformed", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("not-json", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getViewerProfile("alice")).rejects.toThrow("Invalid profile response");
  });

  it("throws when update profile requires sign in", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice",
      bio: "Updated",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
    };

    await expect(updateViewerProfile("alice", input)).rejects.toThrow(
      "You need to sign in to edit this profile",
    );
  });

  it("throws when update profile is attempted for another user", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice",
      bio: "Updated",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
    };

    await expect(updateViewerProfile("alice", input)).rejects.toThrow(
      "You can edit only your own profile",
    );
  });

  it("uses backend error message when update profile fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: "Display name is too long",
          },
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice",
      bio: "Updated",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
    };

    await expect(updateViewerProfile("alice", input)).rejects.toThrow(
      "Display name is too long",
    );
  });

  it("falls back to default update profile error when backend message is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("failed", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice",
      bio: "Updated",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
    };

    await expect(updateViewerProfile("alice", input)).rejects.toThrow(
      "Failed to update profile",
    );
  });

  it("updates profile and sends default removeCustomAvatar=false", async () => {
    const profile = createViewerProfile();
    const fetchMock = vi.fn().mockResolvedValue(createProfileResponse(profile));
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice Updated",
      bio: "Updated bio",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
    };

    const result = await updateViewerProfile("alice", input);

    expect(result).toEqual(profile);

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.method).toBe("PATCH");
    expect(request.credentials).toBe("include");
    expect(request.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(request.body))).toEqual({
      displayName: "Alice Updated",
      bio: "Updated bio",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
      removeCustomAvatar: false,
    });
  });

  it("preserves explicit removeCustomAvatar=true in update payload", async () => {
    const profile = createViewerProfile();
    const fetchMock = vi.fn().mockResolvedValue(createProfileResponse(profile));
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice Updated",
      bio: "Updated bio",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
      removeCustomAvatar: true,
    };

    await updateViewerProfile("alice", input);

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(request.body))).toMatchObject({
      removeCustomAvatar: true,
    });
  });

  it("throws when updated profile response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ profile: { id: "broken" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const input: UpdateViewerProfileInput = {
      displayName: "Alice Updated",
      bio: "Updated bio",
      country: "United States",
      countryCode: "US",
      stateProvince: "CA",
      city: "San Francisco",
    };

    await expect(updateViewerProfile("alice", input)).rejects.toThrow(
      "Invalid updated profile response",
    );
  });

  it("uploads avatar and returns updated profile", async () => {
    const profile = createViewerProfile();
    const fetchMock = vi.fn().mockResolvedValue(createProfileResponse(profile));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    const result = await updateViewerAvatar("alice", file);

    expect(result).toEqual(profile);

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.method).toBe("POST");
    expect(request.credentials).toBe("include");
    expect(request.body).toBeInstanceOf(FormData);
    expect((request.body as FormData).get("avatar")).toBe(file);
  });

  it("throws when avatar update requires sign in", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(updateViewerAvatar("alice", file)).rejects.toThrow(
      "You need to sign in to edit this profile",
    );
  });

  it("throws when avatar update is attempted for another user", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(updateViewerAvatar("alice", file)).rejects.toThrow(
      "You can edit only your own profile",
    );
  });

  it("uses backend error message when avatar update fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: "Avatar is too large",
          },
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(updateViewerAvatar("alice", file)).rejects.toThrow(
      "Avatar is too large",
    );
  });

  it("falls back to default avatar update error when backend message is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("failed", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(updateViewerAvatar("alice", file)).rejects.toThrow(
      "Failed to update profile photo",
    );
  });

  it("throws when updated avatar response shape is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ profile: { id: "broken" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["avatar"], "avatar.png", {
      type: "image/png",
    });

    await expect(updateViewerAvatar("alice", file)).rejects.toThrow(
      "Invalid updated profile response",
    );
  });
});
