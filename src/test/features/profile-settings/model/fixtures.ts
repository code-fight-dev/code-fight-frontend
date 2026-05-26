import type { ViewerProfile, ViewerProfileStats } from "@/entities/viewer";
import type { ProfileSettingsDraft } from "@/features/profile-settings/model/profileSettingsForm";

type ViewerProfileFixtureOverrides = Partial<
  Omit<ViewerProfile, "stats" | "eloHistory" | "topLanguages" | "recentMatches">
> & {
  stats?: Partial<ViewerProfileStats>;
};

export function createViewerProfileFixture(
  overrides: ViewerProfileFixtureOverrides = {},
): ViewerProfile {
  return {
    id: overrides.id ?? "viewer-1",
    username: overrides.username ?? "alice",
    displayName: overrides.displayName ?? "Alice",
    bio: overrides.bio ?? "Practicing algorithms",
    country: overrides.country ?? "United States",
    countryCode: overrides.countryCode ?? "US",
    stateProvince: overrides.stateProvince ?? "California",
    city: overrides.city ?? "San Francisco",
    avatarUrl: overrides.avatarUrl ?? "https://example.com/avatar.png",
    providerAvatarUrl:
      overrides.providerAvatarUrl ?? "https://example.com/provider-avatar.png",
    avatarSource: overrides.avatarSource ?? "custom",
    authProvider: overrides.authProvider ?? "github",
    createdAt: overrides.createdAt ?? "2026-05-24T12:00:00.000Z",
    stats: {
      eloRating: 1500,
      globalRank: 101,
      globalPlayersCount: 2000,
      regionalRank: 15,
      regionalPlayersCount: 500,
      winRate: 66.7,
      totalMatches: 30,
      wins: 20,
      losses: 8,
      draws: 2,
      avgSolutionTimeSeconds: 120,
      maxWinStreak: 6,
      ...overrides.stats,
    },
    eloHistory: [
      {
        date: "2026-05-23",
        delta: 14,
        rating: 1500,
        matchesPlayed: 30,
      },
    ],
    topLanguages: [
      {
        name: "TypeScript",
        usageShare: 0.72,
      },
    ],
    recentMatches: [
      {
        id: "match-1",
        result: "win",
        opponent: {
          id: "viewer-2",
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

export function createProfileSettingsDraftFixture(
  overrides: Partial<ProfileSettingsDraft> = {},
): ProfileSettingsDraft {
  return {
    displayName: "Alice",
    bio: "Practicing algorithms",
    country: "United States",
    countryCode: "US",
    stateProvince: "California",
    city: "San Francisco",
    avatarUrl: "https://example.com/avatar.png",
    avatarSource: "custom",
    pendingAvatarFile: null,
    removeCustomAvatar: false,
    ...overrides,
  };
}
