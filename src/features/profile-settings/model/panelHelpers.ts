import type {
  AvatarSource,
  UpdateViewerProfileInput,
  ViewerProfile,
} from "@/entities/viewer";
import {
  createProfileSettingsLocationDraft,
  getResolvedProfileCountryCode,
  type ProfileSettingsDraft,
} from "@/features/profile-settings/model/profileSettingsForm";
import type { ProfileSettingsTabId } from "@/features/profile-settings/model/tabs";

export type ProfileSettingsSaveTarget = ProfileSettingsTabId;
export type ProfileSettingsChangeFlags = Record<ProfileSettingsSaveTarget, boolean>;
export type ProfileSettingsTabSummaries = Record<ProfileSettingsTabId, string>;

export const PROFILE_SETTINGS_SUCCESS_MESSAGES: Record<
  ProfileSettingsSaveTarget,
  string
> = {
  photo: "Successfully updated your profile photo.",
  "display-name": "Successfully updated your display name.",
  location: "Successfully updated your location.",
  bio: "Successfully updated your public bio.",
};

export function buildPersistedProfileInput(
  profile: ViewerProfile,
): UpdateViewerProfileInput {
  return {
    displayName: profile.displayName,
    bio: profile.bio,
    country: profile.country,
    countryCode: getResolvedProfileCountryCode(profile),
    stateProvince: profile.stateProvince,
    city: profile.city,
  };
}

export function getProfileSettingsErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function buildProfileSettingsChangeFlags(
  profileState: ViewerProfile,
  draft: ProfileSettingsDraft,
): ProfileSettingsChangeFlags {
  const profileCountryCode = getResolvedProfileCountryCode(profileState);

  return {
    photo: draft.pendingAvatarDataUrl !== "" || draft.removeCustomAvatar,
    "display-name": profileState.displayName !== draft.displayName,
    location:
      profileState.country !== draft.country ||
      profileCountryCode !== draft.countryCode ||
      profileState.stateProvince !== draft.stateProvince ||
      profileState.city !== draft.city,
    bio: profileState.bio !== draft.bio,
  };
}

export function buildProfileSettingsTabSummaries(
  profileState: ViewerProfile,
  draft: ProfileSettingsDraft,
): ProfileSettingsTabSummaries {
  return {
    photo: getPhotoSummary(draft.avatarSource),
    "display-name": draft.displayName || profileState.username,
    location: getLocationSummary(draft),
    bio: getBioSummary(draft.bio),
  };
}

export function buildTargetPayload(
  target: ProfileSettingsSaveTarget,
  profileState: ViewerProfile,
  draft: ProfileSettingsDraft,
): UpdateViewerProfileInput {
  const persistedProfileInput = buildPersistedProfileInput(profileState);

  switch (target) {
    case "photo":
      return {
        ...persistedProfileInput,
        avatarDataUrl: draft.pendingAvatarDataUrl || undefined,
        removeCustomAvatar: draft.removeCustomAvatar,
      };
    case "display-name":
      return {
        ...persistedProfileInput,
        displayName: draft.displayName,
      };
    case "location":
      return {
        ...persistedProfileInput,
        country: draft.country,
        countryCode: draft.countryCode,
        stateProvince: draft.stateProvince,
        city: draft.city,
      };
    case "bio":
      return {
        ...persistedProfileInput,
        bio: draft.bio,
      };
  }
}

export function syncDraftAfterSave(
  target: ProfileSettingsSaveTarget,
  currentDraft: ProfileSettingsDraft,
  updatedProfile: ViewerProfile,
): ProfileSettingsDraft {
  switch (target) {
    case "photo":
      return {
        ...currentDraft,
        avatarUrl: updatedProfile.avatarUrl,
        avatarSource: updatedProfile.avatarSource,
        pendingAvatarDataUrl: "",
        removeCustomAvatar: false,
      };
    case "display-name":
      return {
        ...currentDraft,
        displayName: updatedProfile.displayName,
      };
    case "location":
      return {
        ...currentDraft,
        ...createProfileSettingsLocationDraft(updatedProfile),
      };
    case "bio":
      return {
        ...currentDraft,
        bio: updatedProfile.bio,
      };
  }
}

export function waitForDuration(durationMs: number): Promise<void> {
  if (durationMs <= 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function getPhotoSummary(avatarSource: AvatarSource): string {
  if (avatarSource === "custom") {
    return "Custom image uploaded";
  }

  if (avatarSource === "provider") {
    return "Provider avatar active";
  }

  return "Generated initial avatar";
}

function getLocationSummary(
  draft: Pick<ProfileSettingsDraft, "city" | "stateProvince" | "country">,
): string {
  return (
    [draft.city, draft.stateProvince, draft.country].filter(Boolean).join(", ") ||
    "Optional"
  );
}

function getBioSummary(bio: string): string {
  return bio.trim() || "Add a short public summary for your profile hero.";
}
