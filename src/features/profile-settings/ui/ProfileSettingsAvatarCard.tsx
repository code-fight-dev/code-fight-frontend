"use client";

import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { useId } from "react";
import type { AvatarSource } from "@/entities/viewer";
import {
  getAvatarAlt,
  getProfileInitial,
  shouldBypassAvatarOptimization,
  shouldShowGeneratedAvatar,
} from "@/entities/viewer";
import { ProfileSettingsErrorNotice } from "@/features/profile-settings/ui/ProfileSettingsErrorNotice";
import { Button } from "@/shared/ui/Button";
import { ProfileSettingsFormActions } from "@/features/profile-settings/ui/ProfileSettingsFormActions";
import { ProfileSettingsSectionCard } from "@/features/profile-settings/ui/ProfileSettingsSectionCard";

type Props = {
  username: string;
  displayName: string;
  avatarUrl: string;
  avatarSource: AvatarSource;
  isSaving: boolean;
  isSavePending: boolean;
  hasChanges: boolean;
  errorMessage: string | null;
  saveErrorMessage: string | null;
  onFileChange: (file: File | null) => void;
  onRemoveCustomAvatar: () => void;
  onReset: () => void;
  onSave: () => void;
};

export function ProfileSettingsAvatarCard({
  username,
  displayName,
  avatarUrl,
  avatarSource,
  isSaving,
  isSavePending,
  hasChanges,
  errorMessage,
  saveErrorMessage,
  onFileChange,
  onRemoveCustomAvatar,
  onReset,
  onSave,
}: Props) {
  const inputId = useId();
  const showGeneratedAvatar = shouldShowGeneratedAvatar(avatarUrl, avatarSource);

  return (
    <ProfileSettingsSectionCard
      eyebrow="Photo"
      title="Update profile photo"
      description="Upload a custom image or fall back to the provider avatar or generated initial."
      contentClassName="mt-6 flex flex-col gap-5"
    >
      <>
        <div className="relative mx-auto w-fit">
          <div className="app-motion-decorative app-avatar-display-glow absolute inset-0 rounded-[36px] blur-xl" />
          <div className="app-avatar-display-frame relative flex h-34 w-34 items-center justify-center overflow-hidden rounded-[34px]">
            {showGeneratedAvatar ? (
              <div className="flex h-full w-full items-center justify-center bg-white text-[3rem] font-semibold tracking-[-0.08em] text-slate-900">
                {getProfileInitial(username)}
              </div>
            ) : (
              <Image
                src={avatarUrl}
                alt={getAvatarAlt(username)}
                fill
                preload
                unoptimized={shouldBypassAvatarOptimization(avatarUrl)}
                sizes="136px"
                className="object-cover"
              />
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-[1rem] font-semibold tracking-[-0.04em] text-(--app-text-strong)">
            {displayName || username}
          </div>
          <div className="mt-1 text-[14px] tracking-[-0.02em] text-(--app-text-muted)">
            @{username}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          <input
            id={inputId}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
            disabled={isSaving}
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              onFileChange(nextFile);
              event.currentTarget.value = "";
            }}
            className="sr-only"
          />

          <label
            htmlFor={inputId}
            className="app-settings-upload-trigger font-accent inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold tracking-[-0.03em] transition-colors"
          >
            <Camera className="h-4 w-4" strokeWidth={1.9} />
            Upload Photo
          </label>

          {avatarSource === "custom" ? (
            <Button
              variant="secondary"
              onClick={onRemoveCustomAvatar}
              disabled={isSaving}
              className="min-h-11 rounded-full px-4 text-[13px]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.9} />
              Remove Custom
            </Button>
          ) : null}
        </div>

        <div className="text-center text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
          Supported formats: JPG, JPEG, PNG, GIF
        </div>

        <ProfileSettingsErrorNotice
          message={errorMessage}
          className="px-3.5 py-3 text-[13px]"
        />
        <ProfileSettingsErrorNotice
          message={saveErrorMessage}
          className="px-3.5 py-3 text-[13px]"
        />

        <ProfileSettingsFormActions
          onReset={onReset}
          onSave={onSave}
          isSaving={isSaving}
          isSavePending={isSavePending}
          hasChanges={hasChanges}
        />
      </>
    </ProfileSettingsSectionCard>
  );
}
