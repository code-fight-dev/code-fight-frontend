import { describe, expect, it } from "vitest";

import {
  ARENA_HREF,
  buildArenaMatchHref,
  buildArenaReplayHref,
  buildViewerProfileHref,
  CHALLENGES_HREF,
  HOME_HREF,
  RANKING_HREF,
  SETTINGS_APPEARANCE_HREF,
  SETTINGS_EDITOR_HREF,
  SETTINGS_PERFORMANCE_HREF,
  SETTINGS_PROFILE_HREF,
  SETTINGS_ROUTES,
} from "@/shared/config/routes";

describe("route constants", () => {
  it("defines main navigation routes", () => {
    expect(HOME_HREF).toBe("/");
    expect(ARENA_HREF).toBe("/arena");
    expect(RANKING_HREF).toBe("/ranking");
    expect(CHALLENGES_HREF).toBe("/challenges");
  });

  it("defines settings routes", () => {
    expect(SETTINGS_ROUTES).toEqual({
      profile: "/settings/profile",
      appearance: "/settings/appearance",
      performance: "/settings/performance",
      editor: "/settings/editor",
    });
  });

  it("exports individual settings href constants from SETTINGS_ROUTES", () => {
    expect(SETTINGS_PROFILE_HREF).toBe(SETTINGS_ROUTES.profile);
    expect(SETTINGS_APPEARANCE_HREF).toBe(SETTINGS_ROUTES.appearance);
    expect(SETTINGS_PERFORMANCE_HREF).toBe(SETTINGS_ROUTES.performance);
    expect(SETTINGS_EDITOR_HREF).toBe(SETTINGS_ROUTES.editor);
  });
});

describe("buildViewerProfileHref", () => {
  it("builds viewer profile route by username", () => {
    expect(buildViewerProfileHref("lyosha")).toBe("/u/lyosha");
  });

  it("encodes unsafe username characters", () => {
    expect(buildViewerProfileHref("john doe")).toBe("/u/john%20doe");
    expect(buildViewerProfileHref("user/name")).toBe("/u/user%2Fname");
    expect(buildViewerProfileHref("user@example.com")).toBe("/u/user%40example.com");
  });
});

describe("buildArenaMatchHref", () => {
  it("builds arena match route by match id", () => {
    expect(buildArenaMatchHref("match-123")).toBe("/arena/match/match-123");
  });

  it("encodes unsafe match id characters", () => {
    expect(buildArenaMatchHref("match/123")).toBe("/arena/match/match%2F123");
    expect(buildArenaMatchHref("match 123")).toBe("/arena/match/match%20123");
  });
});

describe("buildArenaReplayHref", () => {
  it("builds arena replay route by match id", () => {
    expect(buildArenaReplayHref("match-123")).toBe("/arena/replay/match-123");
  });

  it("encodes unsafe match id characters", () => {
    expect(buildArenaReplayHref("match/123")).toBe("/arena/replay/match%2F123");
    expect(buildArenaReplayHref("match 123")).toBe("/arena/replay/match%20123");
  });
});
