import { cn } from "@/shared/lib/cn";
import { ProfileSettingsSaveButton } from "@/features/profile-settings/ui/ProfileSettingsSaveButton";
import { Button } from "@/shared/ui/Button";

type Props = Readonly<{
  className?: string;
  hasChanges: boolean;
  isSavePending: boolean;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
}>;

export function ProfileSettingsFormActions({
  className,
  hasChanges,
  isSavePending,
  isSaving,
  onReset,
  onSave,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-(--app-settings-divider) pt-5 sm:flex-row sm:justify-end",
        className,
      )}
    >
      <Button
        variant="secondary"
        onClick={onReset}
        disabled={isSaving || !hasChanges}
        className="min-h-10 w-full rounded-xl px-4 text-[13px] sm:w-auto"
      >
        Cancel
      </Button>
      <ProfileSettingsSaveButton
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        isPending={isSavePending}
      />
    </div>
  );
}
