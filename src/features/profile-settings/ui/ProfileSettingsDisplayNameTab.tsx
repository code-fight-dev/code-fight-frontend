import { UserRound } from "lucide-react";
import { PROFILE_DISPLAY_NAME_LIMIT } from "@/features/profile-settings/model/constants";
import { ProfileSettingsErrorNotice } from "@/features/profile-settings/ui/ProfileSettingsErrorNotice";
import { ProfileSettingsFormActions } from "@/features/profile-settings/ui/ProfileSettingsFormActions";
import { ProfileSettingsSectionCard } from "@/features/profile-settings/ui/ProfileSettingsSectionCard";

type Props = {
  displayName: string;
  isSaving: boolean;
  isSavePending: boolean;
  hasChanges: boolean;
  errorMessage: string | null;
  onDisplayNameChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
};

export function ProfileSettingsDisplayNameTab({
  displayName,
  isSaving,
  isSavePending,
  hasChanges,
  errorMessage,
  onDisplayNameChange,
  onReset,
  onSave,
}: Props) {
  return (
    <ProfileSettingsSectionCard
      eyebrow="Display Name"
      eyebrowIcon={<UserRound className="h-4.5 w-4.5" strokeWidth={1.95} />}
      title="Update display name"
      description="Changing your display name won't change your username."
    >
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
            Public name
          </span>
          <span className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
            {displayName.length}/{PROFILE_DISPLAY_NAME_LIMIT}
          </span>
        </div>

        <input
          value={displayName}
          maxLength={PROFILE_DISPLAY_NAME_LIMIT}
          disabled={isSaving}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="How your name appears on the profile page"
          className="app-input-surface h-14.5 w-full rounded-2xl px-4 text-[16px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.12)]"
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
