import type { AvatarSource, ViewerProfile } from "@/entities/viewer";
import { resolveCountryCode } from "@/shared/lib/country";

export type ProfileSettingsDraft = {
  displayName: string;
  bio: string;
  country: string;
  countryCode: string;
  stateProvince: string;
  city: string;
  avatarUrl: string;
  avatarSource: AvatarSource;
  pendingAvatarDataUrl: string;
  removeCustomAvatar: boolean;
};

type ViewerProfileLocation = Pick<
  ViewerProfile,
  "country" | "countryCode" | "stateProvince" | "city"
>;

export type ProfileSettingsLocationDraft = Pick<
  ProfileSettingsDraft,
  "country" | "countryCode" | "stateProvince" | "city"
>;

export function getResolvedProfileCountryCode(
  profile: Pick<ViewerProfile, "country" | "countryCode">,
) {
  return resolveCountryCode(profile.countryCode, profile.country);
}

export function createProfileSettingsLocationDraft(
  profile: ViewerProfileLocation,
): ProfileSettingsLocationDraft {
  return {
    country: profile.country,
    countryCode: getResolvedProfileCountryCode(profile),
    stateProvince: profile.stateProvince,
    city: profile.city,
  };
}

export function createProfileSettingsDraft(profile: ViewerProfile): ProfileSettingsDraft {
  return {
    displayName: profile.displayName,
    bio: profile.bio,
    ...createProfileSettingsLocationDraft(profile),
    avatarUrl: profile.avatarUrl,
    avatarSource: profile.avatarSource,
    pendingAvatarDataUrl: "",
    removeCustomAvatar: false,
  };
}

export function getProfileSettingsFallbackAvatar(profile: ViewerProfile) {
  return {
    avatarUrl: profile.providerAvatarUrl,
    avatarSource: (profile.providerAvatarUrl ? "provider" : "none") as AvatarSource,
  };
}
