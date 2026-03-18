"use client";

import { useEffect, useState, useTransition } from "react";
import {
  readAvatarFile,
  updateViewerProfile,
  validateAvatarFile,
} from "@/entities/viewer";
import type {
  AvatarSource,
  UpdateViewerProfileInput,
  ViewerProfile,
} from "@/entities/viewer";
import { getCountryCodeByName } from "@/shared/lib/country";
import {
  getLocationCityOptions,
  getLocationCountryOptions,
  getLocationStateOptions,
} from "../api/locationCatalog";
import { PROFILE_SETTINGS_TOAST_DURATION_MS } from "./constants";
import {
  createProfileSettingsDraft,
  createProfileSettingsLocationDraft,
  getProfileSettingsFallbackAvatar,
  getResolvedProfileCountryCode,
  type ProfileSettingsDraft,
} from "./profileSettingsForm";
import type { ProfileSettingsTabId } from "./tabs";

type SaveTarget = ProfileSettingsTabId;
type ChangeFlags = Record<SaveTarget, boolean>;

const PROFILE_SETTINGS_SUCCESS_MESSAGES: Record<SaveTarget, string> = {
  photo: "Successfully updated your profile photo.",
  "display-name": "Successfully updated your display name.",
  location: "Successfully updated your location.",
  bio: "Successfully updated your public bio.",
};

function buildPersistedProfileInput(profile: ViewerProfile): UpdateViewerProfileInput {
  return {
    displayName: profile.displayName,
    bio: profile.bio,
    country: profile.country,
    countryCode: getResolvedProfileCountryCode(profile),
    stateProvince: profile.stateProvince,
    city: profile.city,
  };
}

function getProfileSettingsErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getPhotoSummary(avatarSource: AvatarSource) {
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
) {
  return (
    [draft.city, draft.stateProvince, draft.country].filter(Boolean).join(", ") ||
    "Optional"
  );
}

function getBioSummary(bio: string) {
  return bio.trim() || "Add a short public summary for your profile hero.";
}

function buildTargetPayload(
  target: SaveTarget,
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

function syncDraftAfterSave(
  target: SaveTarget,
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

export function useProfileSettingsPanel(profile: ViewerProfile) {
  const [profileState, setProfileState] = useState(profile);
  const [draft, setDraft] = useState<ProfileSettingsDraft>(() =>
    createProfileSettingsDraft(profile),
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<SaveTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileSettingsTabId>("display-name");
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [stateProvinceOptions, setStateProvinceOptions] = useState<string[]>([]);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [locationLookupError, setLocationLookupError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const photoHasChanges = draft.pendingAvatarDataUrl !== "" || draft.removeCustomAvatar;
  const displayNameHasChanges = profileState.displayName !== draft.displayName;
  const profileCountryCode = getResolvedProfileCountryCode(profileState);
  const locationHasChanges =
    profileState.country !== draft.country ||
    profileCountryCode !== draft.countryCode ||
    profileState.stateProvince !== draft.stateProvince ||
    profileState.city !== draft.city;
  const bioHasChanges = profileState.bio !== draft.bio;

  const changeFlags: ChangeFlags = {
    photo: photoHasChanges,
    "display-name": displayNameHasChanges,
    location: locationHasChanges,
    bio: bioHasChanges,
  };

  const tabsSummaries: Record<ProfileSettingsTabId, string> = {
    photo: getPhotoSummary(draft.avatarSource),
    "display-name": draft.displayName || profileState.username,
    location: getLocationSummary(draft),
    bio: getBioSummary(draft.bio),
  };

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, PROFILE_SETTINGS_TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  useEffect(() => {
    if (activeTab !== "location" || countryOptions.length > 0) {
      return;
    }

    let isCancelled = false;

    getLocationCountryOptions()
      .then((options) => {
        if (!isCancelled) {
          setCountryOptions(options);
          setLocationLookupError(null);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setLocationLookupError(
            getProfileSettingsErrorMessage(error, "Failed to load countries"),
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, countryOptions.length]);

  useEffect(() => {
    if (activeTab !== "location" || !draft.country) {
      return;
    }

    let isCancelled = false;

    getLocationStateOptions(draft.country)
      .then(async (options) => {
        if (isCancelled) {
          return;
        }

        setStateProvinceOptions(options);
        setLocationLookupError(null);

        if (draft.stateProvince && !options.includes(draft.stateProvince)) {
          setDraft((currentDraft) => ({
            ...currentDraft,
            stateProvince: "",
            city: "",
          }));
          setCityOptions([]);
          return;
        }

        if (options.length > 0 && !draft.stateProvince) {
          setCityOptions([]);
          return;
        }

        try {
          const nextCityOptions = await getLocationCityOptions(
            draft.country,
            draft.stateProvince,
          );

          if (isCancelled) {
            return;
          }

          setCityOptions(nextCityOptions);
          setLocationLookupError(null);

          setDraft((currentDraft) =>
            currentDraft.city && !nextCityOptions.includes(currentDraft.city)
              ? {
                  ...currentDraft,
                  city: "",
                }
              : currentDraft,
          );
        } catch (error) {
          if (!isCancelled) {
            setLocationLookupError(
              getProfileSettingsErrorMessage(error, "Failed to load cities"),
            );
            setCityOptions([]);
          }
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setLocationLookupError(
            getProfileSettingsErrorMessage(error, "Failed to load states or provinces"),
          );
          setStateProvinceOptions([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, draft.country, draft.stateProvince]);

  function clearSaveFeedback() {
    setSaveError(null);
    setFeedbackTarget(null);
  }

  function clearLocationFeedback() {
    clearSaveFeedback();
    setLocationLookupError(null);
  }

  function updateDraftField<K extends keyof ProfileSettingsDraft>(
    key: K,
    value: ProfileSettingsDraft[K],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }));
    clearSaveFeedback();
  }

  function resetPhoto() {
    const fallback = getProfileSettingsFallbackAvatar(profileState);

    setAvatarError(null);
    clearSaveFeedback();
    setDraft((currentDraft) => ({
      ...currentDraft,
      avatarUrl: profileState.avatarUrl || fallback.avatarUrl,
      avatarSource: profileState.avatarSource || fallback.avatarSource,
      pendingAvatarDataUrl: "",
      removeCustomAvatar: false,
    }));
  }

  function resetDisplayName() {
    updateDraftField("displayName", profileState.displayName);
  }

  function resetLocation() {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...createProfileSettingsLocationDraft(profileState),
    }));
    clearLocationFeedback();
  }

  function resetBio() {
    updateDraftField("bio", profileState.bio);
  }

  async function handleAvatarFileChange(file: File | null) {
    clearSaveFeedback();

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    try {
      const avatarDataUrl = await readAvatarFile(file);
      setAvatarError(null);
      setDraft((currentDraft) => ({
        ...currentDraft,
        avatarUrl: avatarDataUrl,
        avatarSource: "custom",
        pendingAvatarDataUrl: avatarDataUrl,
        removeCustomAvatar: false,
      }));
    } catch (error) {
      setAvatarError(getProfileSettingsErrorMessage(error, "Failed to read avatar file"));
    }
  }

  function handleRemoveCustomAvatar() {
    const fallback = getProfileSettingsFallbackAvatar(profileState);

    setAvatarError(null);
    clearSaveFeedback();
    setDraft((currentDraft) => ({
      ...currentDraft,
      avatarUrl: fallback.avatarUrl,
      avatarSource: fallback.avatarSource,
      pendingAvatarDataUrl: "",
      removeCustomAvatar: profileState.avatarSource === "custom",
    }));
  }

  function handleCountryChange(value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      country: value,
      countryCode: getCountryCodeByName(value),
      stateProvince: "",
      city: "",
    }));
    clearLocationFeedback();
    setStateProvinceOptions([]);
    setCityOptions([]);
  }

  function handleStateProvinceChange(value: string) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      stateProvince: value,
      city: "",
    }));
    clearLocationFeedback();
    setCityOptions([]);
  }

  function getSaveErrorMessage(target: SaveTarget) {
    return feedbackTarget === target ? saveError : null;
  }

  function handleSave(target: SaveTarget) {
    if (isSaving || !changeFlags[target]) {
      return;
    }

    startSaving(async () => {
      try {
        setSaveError(null);
        setFeedbackTarget(target);
        setToastMessage(null);

        const updatedProfile = await updateViewerProfile(
          profileState.username,
          buildTargetPayload(target, profileState, draft),
        );

        setProfileState(updatedProfile);
        setDraft((currentDraft) =>
          syncDraftAfterSave(target, currentDraft, updatedProfile),
        );
        setAvatarError(null);
        setToastMessage(PROFILE_SETTINGS_SUCCESS_MESSAGES[target]);
      } catch (error) {
        setSaveError(getProfileSettingsErrorMessage(error, "Failed to update profile"));
      }
    });
  }

  return {
    toastMessage,
    tabsProps: {
      activeTab,
      onTabChange: (tab: ProfileSettingsTabId) => setActiveTab(tab),
      summaries: tabsSummaries,
    },
    photoSectionProps: {
      username: profileState.username,
      displayName: draft.displayName,
      avatarUrl: draft.avatarUrl,
      avatarSource: draft.avatarSource,
      isSaving,
      hasChanges: photoHasChanges,
      errorMessage: avatarError,
      saveErrorMessage: getSaveErrorMessage("photo"),
      onFileChange: handleAvatarFileChange,
      onRemoveCustomAvatar: handleRemoveCustomAvatar,
      onReset: resetPhoto,
      onSave: () => handleSave("photo"),
    },
    displayNameSectionProps: {
      displayName: draft.displayName,
      isSaving,
      hasChanges: displayNameHasChanges,
      errorMessage: getSaveErrorMessage("display-name"),
      onDisplayNameChange: (value: string) => updateDraftField("displayName", value),
      onReset: resetDisplayName,
      onSave: () => handleSave("display-name"),
    },
    locationSectionProps: {
      country: draft.country,
      stateProvince: draft.stateProvince,
      city: draft.city,
      countryOptions,
      stateProvinceOptions,
      cityOptions,
      isSaving,
      hasChanges: locationHasChanges,
      errorMessage: locationLookupError ?? getSaveErrorMessage("location"),
      onCountryChange: handleCountryChange,
      onStateProvinceChange: handleStateProvinceChange,
      onCityChange: (value: string) => updateDraftField("city", value),
      onReset: resetLocation,
      onSave: () => handleSave("location"),
    },
    bioSectionProps: {
      bio: draft.bio,
      isSaving,
      hasChanges: bioHasChanges,
      errorMessage: getSaveErrorMessage("bio"),
      onBioChange: (value: string) => updateDraftField("bio", value),
      onReset: resetBio,
      onSave: () => handleSave("bio"),
    },
  };
}
