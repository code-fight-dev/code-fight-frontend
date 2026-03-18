"use client";

import Image from "next/image";
import { Camera, RefreshCcw, Trash2 } from "lucide-react";
import { useId } from "react";
import {
  getAvatarAlt,
  getProfileInitial,
  shouldShowGeneratedAvatar,
} from "@/entities/viewer";
import type { AvatarSource } from "@/entities/viewer";
import { Button } from "@/shared/ui/Button";

type Props = {
  username: string;
  avatarUrl: string;
  avatarSource: AvatarSource;
  isEditable: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  onFileChange: (file: File | null) => void;
  onRemoveCustomAvatar: () => void;
};

export function AvatarSection({
  username,
  avatarUrl,
  avatarSource,
  isEditable,
  isSaving,
  errorMessage,
  onFileChange,
  onRemoveCustomAvatar,
}: Props) {
  const inputId = useId();
  const showGeneratedAvatar = shouldShowGeneratedAvatar(avatarUrl, avatarSource);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-[34px] bg-[radial-gradient(circle_at_24%_18%,rgba(96,165,250,0.24),transparent_52%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.14),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.84),rgba(8,15,30,0.96))] blur-xl" />

        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-4xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_22px_50px_rgba(2,6,23,0.28)] sm:h-34 sm:w-34">
          {showGeneratedAvatar ? (
            <div className="flex h-full w-full items-center justify-center bg-white text-[2.6rem] font-semibold tracking-[-0.08em] text-slate-900 sm:text-[3rem]">
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
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="font-accent text-[11px] tracking-[0.22em] text-blue-300/78 uppercase">
            Avatar
          </div>
          <p className="mt-2 max-w-xs text-[14px] leading-[1.65] tracking-[-0.02em] text-(--app-text-muted)">
            {avatarSource === "provider"
              ? "Provider avatar is active. Upload a custom image any time."
              : avatarSource === "custom"
                ? "Custom avatar is active."
                : "Default minimalist avatar is active."}
          </p>
        </div>

        {isEditable ? (
          <div className="flex flex-wrap gap-2.5">
            <input
              id={inputId}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
              disabled={isSaving}
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              className="sr-only"
            />

            <label
              htmlFor={inputId}
              className="font-accent inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-blue-400/28 bg-blue-500/10 px-4 py-2 text-[13px] font-semibold tracking-[-0.03em] text-blue-100 transition-colors hover:border-blue-300/42 hover:bg-blue-500/14"
            >
              <Camera className="h-4 w-4" strokeWidth={1.9} />
              Upload Avatar
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
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[13px] tracking-[-0.02em] text-(--app-text-soft)">
            <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
            Avatar is managed by the profile owner.
          </div>
        )}

        <div className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
          Supported formats: JPG, JPEG, PNG, GIF
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/18 bg-red-500/8 px-3.5 py-3 text-[13px] tracking-[-0.02em] text-red-400">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
