"use client";

import { useEffect, useState } from "react";
import { updateViewerAvatar, updateViewerProfile } from "@/entities/viewer";
import type { ViewerProfile } from "@/entities/viewer";
import {
  PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS,
  PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS,
  PROFILE_SETTINGS_TOAST_DURATION_MS,
} from "@/features/profile-settings/model/constants";
import {
  buildProfileSettingsChangeFlags,
  buildProfileSettingsTabSummaries,
  buildTargetPayload,
  getProfileSettingsErrorMessage,
  PROFILE_SETTINGS_SUCCESS_MESSAGES,
  type ProfileSettingsSaveTarget,
  syncDraftAfterSave,
  waitForDuration,
} from "@/features/profile-settings/model/panelHelpers";
import {
  createProfileSettingsDraft,
  type ProfileSettingsDraft,
} from "@/features/profile-settings/model/profileSettingsForm";
import type { ProfileSettingsTabId } from "@/features/profile-settings/model/tabs";
import { useProfileSettingsAvatarState } from "@/features/profile-settings/model/useProfileSettingsAvatarState";
import { useProfileSettingsLocationState } from "@/features/profile-settings/model/useProfileSettingsLocationState";

export function useProfileSettingsPanel(profile: ViewerProfile) {
  const [profileState, setProfileState] = useState(profile);
  const [draft, setDraft] = useState<ProfileSettingsDraft>(() =>
    createProfileSettingsDraft(profile),
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<ProfileSettingsSaveTarget | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileSettingsTabId>("display-name");
  const [isSaving, setIsSaving] = useState(false);
  const [savingTarget, setSavingTarget] = useState<ProfileSettingsSaveTarget | null>(
    null,
  );

  const changeFlags = buildProfileSettingsChangeFlags(profileState, draft);
  const tabsSummaries = buildProfileSettingsTabSummaries(profileState, draft);

  function clearSaveFeedback() {
    setSaveError(null);
    setFeedbackTarget(null);
  }

  const {
    avatarError,
    clearAvatarError,
    handleAvatarFileChange,
    handleRemoveCustomAvatar,
    resetPhoto,
  } = useProfileSettingsAvatarState({
    clearSaveFeedback,
    profileState,
    setDraft,
  });

  const {
    cityOptions,
    countryOptions,
    handleCountryChange,
    handleStateProvinceChange,
    locationLookupError,
    resetLocation,
    stateProvinceOptions,
  } = useProfileSettingsLocationState({
    activeTab,
    clearSaveFeedback,
    draft,
    profileState,
    setDraft,
  });

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

  function resetDisplayName() {
    updateDraftField("displayName", profileState.displayName);
  }

  function resetBio() {
    updateDraftField("bio", profileState.bio);
  }

  function getSaveErrorMessage(target: ProfileSettingsSaveTarget) {
    return feedbackTarget === target ? saveError : null;
  }

  async function handleSave(target: ProfileSettingsSaveTarget) {
    if (isSaving || !changeFlags[target]) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setFeedbackTarget(target);
    setToastMessage(null);

    let savingIndicatorShownAt = 0;
    const savingIndicatorTimeoutId = window.setTimeout(() => {
      savingIndicatorShownAt = Date.now();
      setSavingTarget(target);
    }, PROFILE_SETTINGS_SAVE_INDICATOR_DELAY_MS);

    try {
      const updatedProfile =
        target === "photo" && draft.pendingAvatarFile
          ? await updateViewerAvatar(profileState.username, draft.pendingAvatarFile)
          : await updateViewerProfile(
              profileState.username,
              buildTargetPayload(target, profileState, draft),
            );

      setProfileState(updatedProfile);
      setDraft((currentDraft) =>
        syncDraftAfterSave(target, currentDraft, updatedProfile),
      );
      clearAvatarError();
      setToastMessage(PROFILE_SETTINGS_SUCCESS_MESSAGES[target]);
    } catch (error) {
      setSaveError(getProfileSettingsErrorMessage(error, "Failed to update profile"));
    } finally {
      window.clearTimeout(savingIndicatorTimeoutId);

      if (savingIndicatorShownAt > 0) {
        await waitForDuration(
          PROFILE_SETTINGS_SAVE_INDICATOR_MIN_VISIBLE_MS -
            (Date.now() - savingIndicatorShownAt),
        );
      }

      setSavingTarget(null);
      setIsSaving(false);
    }
  }

  function createSaveHandler(target: ProfileSettingsSaveTarget) {
    return () => {
      void handleSave(target);
    };
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
      isSavePending: savingTarget === "photo",
      hasChanges: changeFlags.photo,
      errorMessage: avatarError,
      saveErrorMessage: getSaveErrorMessage("photo"),
      onFileChange: handleAvatarFileChange,
      onRemoveCustomAvatar: handleRemoveCustomAvatar,
      onReset: resetPhoto,
      onSave: createSaveHandler("photo"),
    },
    displayNameSectionProps: {
      displayName: draft.displayName,
      isSaving,
      isSavePending: savingTarget === "display-name",
      hasChanges: changeFlags["display-name"],
      errorMessage: getSaveErrorMessage("display-name"),
      onDisplayNameChange: (value: string) => updateDraftField("displayName", value),
      onReset: resetDisplayName,
      onSave: createSaveHandler("display-name"),
    },
    locationSectionProps: {
      country: draft.country,
      stateProvince: draft.stateProvince,
      city: draft.city,
      countryOptions,
      stateProvinceOptions,
      cityOptions,
      isSaving,
      isSavePending: savingTarget === "location",
      hasChanges: changeFlags.location,
      errorMessage: locationLookupError ?? getSaveErrorMessage("location"),
      onCountryChange: handleCountryChange,
      onStateProvinceChange: handleStateProvinceChange,
      onCityChange: (value: string) => updateDraftField("city", value),
      onReset: resetLocation,
      onSave: createSaveHandler("location"),
    },
    bioSectionProps: {
      bio: draft.bio,
      isSaving,
      isSavePending: savingTarget === "bio",
      hasChanges: changeFlags.bio,
      errorMessage: getSaveErrorMessage("bio"),
      onBioChange: (value: string) => updateDraftField("bio", value),
      onReset: resetBio,
      onSave: createSaveHandler("bio"),
    },
  };
}
