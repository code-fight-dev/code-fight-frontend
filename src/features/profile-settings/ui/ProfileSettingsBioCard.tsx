import { PenSquare } from "lucide-react";
import { PROFILE_BIO_LIMIT } from "@/features/profile-settings/model/constants";
import { ProfileSettingsErrorNotice } from "@/features/profile-settings/ui/ProfileSettingsErrorNotice";
import { ProfileSettingsFormActions } from "@/features/profile-settings/ui/ProfileSettingsFormActions";
import { ProfileSettingsSectionCard } from "@/features/profile-settings/ui/ProfileSettingsSectionCard";

type Props = {
  bio: string;
  isSaving: boolean;
  isSavePending: boolean;
  hasChanges: boolean;
  errorMessage: string | null;
  onBioChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
};

export function ProfileSettingsBioCard({
  bio,
  isSaving,
  isSavePending,
  hasChanges,
  errorMessage,
  onBioChange,
  onReset,
  onSave,
}: Props) {
  return (
    <ProfileSettingsSectionCard
      eyebrow="Bio"
      eyebrowIcon={<PenSquare className="h-4.5 w-4.5" strokeWidth={1.95} />}
      title="Update bio"
      description="Add a short public summary for the profile hero block."
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
            Public bio
          </span>
          <span className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
            {bio.length}/{PROFILE_BIO_LIMIT}
          </span>
        </div>
        <textarea
          value={bio}
          maxLength={PROFILE_BIO_LIMIT}
          disabled={isSaving}
          onChange={(event) =>
            onBioChange(event.target.value.slice(0, PROFILE_BIO_LIMIT))
          }
          placeholder="Tell others what kind of coder you are, what you enjoy building, or how you compete."
          className="app-input-surface min-h-40 w-full resize-none rounded-3xl px-4 py-4 text-[15px] leading-[1.72] tracking-[-0.025em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.12)]"
        />
      </div>

      <ProfileSettingsErrorNotice
        message={errorMessage}
        className="mt-5 px-4 py-3 text-[14px]"
      />

      <ProfileSettingsFormActions
        className="mt-6"
        onReset={onReset}
        onSave={onSave}
        isSaving={isSaving}
        isSavePending={isSavePending}
        hasChanges={hasChanges}
      />
    </ProfileSettingsSectionCard>
  );
}
