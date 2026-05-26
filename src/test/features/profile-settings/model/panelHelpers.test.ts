import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildPersistedProfileInput,
  buildProfileSettingsChangeFlags,
  buildProfileSettingsTabSummaries,
  buildTargetPayload,
  getProfileSettingsErrorMessage,
  PROFILE_SETTINGS_SUCCESS_MESSAGES,
  syncDraftAfterSave,
  waitForDuration,
} from "@/features/profile-settings/model/panelHelpers";
import type { ProfileSettingsSaveTarget } from "@/features/profile-settings/model/panelHelpers";
import {
  createProfileSettingsDraftFixture,
  createViewerProfileFixture,
} from "./fixtures";

describe("features/profile-settings/model/panelHelpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("exports stable success messages for each save target", () => {
    expect(PROFILE_SETTINGS_SUCCESS_MESSAGES).toEqual({
      photo: "Successfully updated your profile photo.",
      "display-name": "Successfully updated your display name.",
      location: "Successfully updated your location.",
      bio: "Successfully updated your public bio.",
    });
  });

  it("builds persisted profile input from profile state", () => {
    const profile = createViewerProfileFixture({
      countryCode: "us",
    });

    expect(buildPersistedProfileInput(profile)).toEqual({
      displayName: "Alice",
      bio: "Practicing algorithms",
      country: "United States",
      countryCode: "US",
      stateProvince: "California",
      city: "San Francisco",
    });
  });

  it("resolves error message from thrown values", () => {
    expect(getProfileSettingsErrorMessage(new Error("boom"), "fallback message")).toBe(
      "boom",
    );
    expect(getProfileSettingsErrorMessage("boom", "fallback message")).toBe(
      "fallback message",
    );
  });

  it("builds change flags for all profile settings targets", () => {
    const profile = createViewerProfileFixture({
      countryCode: "US",
      avatarSource: "custom",
    });

    const unchangedDraft = createProfileSettingsDraftFixture();
    expect(buildProfileSettingsChangeFlags(profile, unchangedDraft)).toEqual({
      photo: false,
      "display-name": false,
      location: false,
      bio: false,
    });

    const changedDraft = createProfileSettingsDraftFixture({
      displayName: "Alice Cooper",
      bio: "Updated bio",
      country: "Canada",
      countryCode: "CA",
      stateProvince: "Ontario",
      city: "Toronto",
      pendingAvatarFile: new File(["avatar"], "avatar.png", { type: "image/png" }),
      removeCustomAvatar: true,
    });

    expect(buildProfileSettingsChangeFlags(profile, changedDraft)).toEqual({
      photo: true,
      "display-name": true,
      location: true,
      bio: true,
    });
  });

  it("builds tab summaries with photo/location/bio fallbacks", () => {
    const profile = createViewerProfileFixture({
      username: "alice-user",
    });

    expect(
      buildProfileSettingsTabSummaries(
        profile,
        createProfileSettingsDraftFixture({
          avatarSource: "custom",
          displayName: "",
          country: "",
          stateProvince: "",
          city: "",
          bio: "   ",
        }),
      ),
    ).toEqual({
      photo: "Custom image uploaded",
      "display-name": "alice-user",
      location: "Optional",
      bio: "Add a short public summary for your profile hero.",
    });

    expect(
      buildProfileSettingsTabSummaries(
        profile,
        createProfileSettingsDraftFixture({
          avatarSource: "provider",
          city: "San Francisco",
          stateProvince: "California",
          country: "United States",
          bio: "Hello world",
        }),
      ).photo,
    ).toBe("Provider avatar active");

    expect(
      buildProfileSettingsTabSummaries(
        profile,
        createProfileSettingsDraftFixture({
          avatarSource: "none",
        }),
      ).photo,
    ).toBe("Generated initial avatar");
  });

  it("builds target payload per tab with persisted defaults", () => {
    const profile = createViewerProfileFixture({
      countryCode: "US",
    });
    const draft = createProfileSettingsDraftFixture({
      displayName: "Alice Updated",
      bio: "Updated bio",
      country: "Canada",
      countryCode: "CA",
      stateProvince: "Ontario",
      city: "Toronto",
      removeCustomAvatar: true,
    });

    const expectedByTarget: Record<ProfileSettingsSaveTarget, object> = {
      photo: {
        displayName: "Alice",
        bio: "Practicing algorithms",
        country: "United States",
        countryCode: "US",
        stateProvince: "California",
        city: "San Francisco",
        removeCustomAvatar: true,
      },
      "display-name": {
        displayName: "Alice Updated",
        bio: "Practicing algorithms",
        country: "United States",
        countryCode: "US",
        stateProvince: "California",
        city: "San Francisco",
      },
      location: {
        displayName: "Alice",
        bio: "Practicing algorithms",
        country: "Canada",
        countryCode: "CA",
        stateProvince: "Ontario",
        city: "Toronto",
      },
      bio: {
        displayName: "Alice",
        bio: "Updated bio",
        country: "United States",
        countryCode: "US",
        stateProvince: "California",
        city: "San Francisco",
      },
    };

    (["photo", "display-name", "location", "bio"] as const).forEach((target) => {
      expect(buildTargetPayload(target, profile, draft)).toEqual(
        expectedByTarget[target],
      );
    });
  });

  it("syncs draft by saved target", () => {
    const currentDraft = createProfileSettingsDraftFixture({
      avatarUrl: "data:image/png;base64,a",
      avatarSource: "custom",
      pendingAvatarFile: new File(["avatar"], "new.png", { type: "image/png" }),
      removeCustomAvatar: true,
      displayName: "Draft name",
      country: "Canada",
      countryCode: "CA",
      stateProvince: "Ontario",
      city: "Toronto",
      bio: "Draft bio",
    });
    const updatedProfile = createViewerProfileFixture({
      displayName: "Saved name",
      bio: "Saved bio",
      country: "United Kingdom",
      countryCode: "",
      stateProvince: "England",
      city: "London",
      avatarUrl: "https://example.com/saved.png",
      avatarSource: "provider",
    });

    expect(syncDraftAfterSave("photo", currentDraft, updatedProfile)).toEqual({
      ...currentDraft,
      avatarUrl: "https://example.com/saved.png",
      avatarSource: "provider",
      pendingAvatarFile: null,
      removeCustomAvatar: false,
    });
    expect(
      syncDraftAfterSave("display-name", currentDraft, updatedProfile).displayName,
    ).toBe("Saved name");
    expect(syncDraftAfterSave("location", currentDraft, updatedProfile)).toMatchObject({
      country: "United Kingdom",
      countryCode: "GB",
      stateProvince: "England",
      city: "London",
    });
    expect(syncDraftAfterSave("bio", currentDraft, updatedProfile).bio).toBe("Saved bio");
  });

  it("waits for positive duration and resolves immediately for zero or negative", async () => {
    const immediateZero = waitForDuration(0);
    const immediateNegative = waitForDuration(-10);
    await expect(immediateZero).resolves.toBeUndefined();
    await expect(immediateNegative).resolves.toBeUndefined();

    const delayed = waitForDuration(50);
    await vi.advanceTimersByTimeAsync(49);
    let isResolved = false;
    delayed.then(() => {
      isResolved = true;
    });
    expect(isResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await expect(delayed).resolves.toBeUndefined();
  });
});
