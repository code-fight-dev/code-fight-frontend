"use client";

import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { useId } from "react";
import type { AvatarSource } from "@/entities/viewer";
import {
  getAvatarAlt,
  getProfileInitial,
  shouldShowGeneratedAvatar,
} from "@/entities/viewer";
import { Button } from "@/shared/ui/Button";
import { ProfileSettingsSaveButton } from "./ProfileSettingsSaveButton";

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
    <section className="app-settings-section overflow-hidden rounded-[30px] p-5 sm:p-6">
      <div className="app-settings-kicker font-accent text-[12px] tracking-[0.2em] uppercase">
        Photo
      </div>
      <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        Update profile photo
      </h3>
      <p className="mt-2 text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-muted)">
        Upload a custom image or fall back to the provider avatar or generated initial.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <div className="relative mx-auto w-fit">
          <div className="app-avatar-display-glow absolute inset-0 rounded-[36px] blur-xl" />
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
                unoptimized
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

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/18 bg-red-500/8 px-3.5 py-3 text-[13px] tracking-[-0.02em] text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveErrorMessage ? (
          <div className="rounded-2xl border border-red-400/18 bg-red-500/8 px-3.5 py-3 text-[13px] tracking-[-0.02em] text-red-400">
            {saveErrorMessage}
          </div>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-(--app-settings-divider) pt-5">
          <Button
            variant="secondary"
            onClick={onReset}
            disabled={isSaving || !hasChanges}
            className="min-h-10 rounded-xl px-4 text-[13px]"
          >
            Cancel
          </Button>
          <ProfileSettingsSaveButton
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            isPending={isSavePending}
          />
        </div>
      </div>
    </section>
  );
}
