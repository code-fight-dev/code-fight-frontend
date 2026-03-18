import { UserRound } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { ProfileSettingsSaveButton } from "./ProfileSettingsSaveButton";

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

const DISPLAY_NAME_LIMIT = 60;

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
    <section className="app-settings-section overflow-hidden rounded-[30px] p-5 sm:p-6">
      <div className="app-settings-kicker flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase">
        <UserRound className="h-4.5 w-4.5" strokeWidth={1.95} />
        Display Name
      </div>

      <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        Update display name
      </h3>
      <p className="mt-2 text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-muted)">
        Changing your display name won&apos;t change your username.
      </p>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
            Public name
          </span>
          <span className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
            {displayName.length}/{DISPLAY_NAME_LIMIT}
          </span>
        </div>

        <input
          value={displayName}
          maxLength={DISPLAY_NAME_LIMIT}
          disabled={isSaving}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder="How your name appears on the profile page"
          className="app-input-surface h-14.5 w-full rounded-2xl px-4 text-[16px] tracking-[-0.03em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.12)]"
        />
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-[14px] tracking-[-0.02em] text-red-400">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-3 border-t border-(--app-settings-divider) pt-5">
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
    </section>
  );
}
