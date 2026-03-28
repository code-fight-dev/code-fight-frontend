"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { readAvatarFile, validateAvatarFile } from "@/entities/viewer";
import type { ViewerProfile } from "@/entities/viewer";
import { getProfileSettingsErrorMessage } from "@/features/profile-settings/model/panelHelpers";
import {
  getProfileSettingsFallbackAvatar,
  type ProfileSettingsDraft,
} from "@/features/profile-settings/model/profileSettingsForm";

type Props = Readonly<{
  clearSaveFeedback: () => void;
  profileState: ViewerProfile;
  setDraft: Dispatch<SetStateAction<ProfileSettingsDraft>>;
}>;

export function useProfileSettingsAvatarState({
  clearSaveFeedback,
  profileState,
  setDraft,
}: Props) {
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function clearAvatarError() {
    setAvatarError(null);
  }

  function resetPhoto() {
    const fallback = getProfileSettingsFallbackAvatar(profileState);

    clearAvatarError();
    clearSaveFeedback();
    setDraft((currentDraft) => ({
      ...currentDraft,
      avatarUrl: profileState.avatarUrl || fallback.avatarUrl,
      avatarSource: profileState.avatarSource || fallback.avatarSource,
      pendingAvatarDataUrl: "",
      removeCustomAvatar: false,
    }));
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
      clearAvatarError();
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

    clearAvatarError();
    clearSaveFeedback();
    setDraft((currentDraft) => ({
      ...currentDraft,
      avatarUrl: fallback.avatarUrl,
      avatarSource: fallback.avatarSource,
      pendingAvatarDataUrl: "",
      removeCustomAvatar: profileState.avatarSource === "custom",
    }));
  }

  return {
    avatarError,
    clearAvatarError,
    handleAvatarFileChange,
    handleRemoveCustomAvatar,
    resetPhoto,
  };
}
