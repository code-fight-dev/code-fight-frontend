import { describe, expect, it } from "vitest";

import {
  createProfileSettingsDraft,
  createProfileSettingsLocationDraft,
  getProfileSettingsFallbackAvatar,
  getResolvedProfileCountryCode,
} from "@/features/profile-settings/model/profileSettingsForm";
import { createViewerProfileFixture } from "./fixtures";

describe("features/profile-settings/model/profileSettingsForm", () => {
  it("resolves profile country code from explicit valid code", () => {
    expect(
      getResolvedProfileCountryCode({
        country: "United States",
        countryCode: "us",
      }),
    ).toBe("US");
  });

  it("resolves profile country code by country name when code is missing or invalid", () => {
    expect(
      getResolvedProfileCountryCode({
        country: "Canada",
        countryCode: "",
      }),
    ).toBe("CA");

    expect(
      getResolvedProfileCountryCode({
        country: "Unknownland",
        countryCode: "??",
      }),
    ).toBe("");
  });

  it("creates location draft with normalized country code", () => {
    const locationDraft = createProfileSettingsLocationDraft({
      country: "Canada",
      countryCode: "",
      stateProvince: "Ontario",
      city: "Toronto",
    });

    expect(locationDraft).toEqual({
      country: "Canada",
      countryCode: "CA",
      stateProvince: "Ontario",
      city: "Toronto",
    });
  });

  it("creates full profile settings draft from viewer profile", () => {
    const profile = createViewerProfileFixture({
      country: "United States",
      countryCode: "us",
      avatarSource: "provider",
    });

    expect(createProfileSettingsDraft(profile)).toEqual({
      displayName: "Alice",
      bio: "Practicing algorithms",
      country: "United States",
      countryCode: "US",
      stateProvince: "California",
      city: "San Francisco",
      avatarUrl: "https://example.com/avatar.png",
      avatarSource: "provider",
      pendingAvatarFile: null,
      removeCustomAvatar: false,
    });
  });

  it("resolves fallback avatar from provider avatar", () => {
    const fallback = getProfileSettingsFallbackAvatar(
      createViewerProfileFixture({
        providerAvatarUrl: "https://example.com/provider.png",
      }),
    );

    expect(fallback).toEqual({
      avatarUrl: "https://example.com/provider.png",
      avatarSource: "provider",
    });
  });

  it("uses generated avatar fallback when provider avatar is missing", () => {
    const fallback = getProfileSettingsFallbackAvatar(
      createViewerProfileFixture({
        providerAvatarUrl: "",
      }),
    );

    expect(fallback).toEqual({
      avatarUrl: "",
      avatarSource: "none",
    });
  });
});
