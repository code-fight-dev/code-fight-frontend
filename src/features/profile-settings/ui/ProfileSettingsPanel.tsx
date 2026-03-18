"use client";

import type { ViewerProfile } from "@/entities/viewer";
import { useProfileSettingsPanel } from "../model/useProfileSettingsPanel";
import { ProfileSettingsAvatarCard } from "./ProfileSettingsAvatarCard";
import { ProfileSettingsBioCard } from "./ProfileSettingsBioCard";
import { ProfileSettingsDisplayNameTab } from "./ProfileSettingsDisplayNameTab";
import { ProfileSettingsLocationTab } from "./ProfileSettingsLocationTab";
import { ProfileSettingsTabs } from "./ProfileSettingsTabs";
import { ProfileSettingsToast } from "./ProfileSettingsToast";

type Props = {
  profile: ViewerProfile;
};

export function ProfileSettingsPanel({ profile }: Props) {
  const {
    toastMessage,
    tabsProps,
    photoSectionProps,
    displayNameSectionProps,
    locationSectionProps,
    bioSectionProps,
  } = useProfileSettingsPanel(profile);

  return (
    <>
      <ProfileSettingsToast message={toastMessage} />

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.86fr)_minmax(0,1.14fr)]">
        <ProfileSettingsTabs {...tabsProps} />

        <div className="space-y-6">
          {tabsProps.activeTab === "photo" ? (
            <ProfileSettingsAvatarCard {...photoSectionProps} />
          ) : null}

          {tabsProps.activeTab === "display-name" ? (
            <ProfileSettingsDisplayNameTab {...displayNameSectionProps} />
          ) : null}

          {tabsProps.activeTab === "location" ? (
            <ProfileSettingsLocationTab {...locationSectionProps} />
          ) : null}

          {tabsProps.activeTab === "bio" ? (
            <ProfileSettingsBioCard {...bioSectionProps} />
          ) : null}
        </div>
      </div>
    </>
  );
}
