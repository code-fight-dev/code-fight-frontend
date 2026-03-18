import { PenSquare } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { PROFILE_BIO_LIMIT } from "../model/constants";

type Props = {
  bio: string;
  isSaving: boolean;
  hasChanges: boolean;
  errorMessage: string | null;
  onBioChange: (value: string) => void;
  onReset: () => void;
  onSave: () => void;
};

export function ProfileSettingsBioCard({
  bio,
  isSaving,
  hasChanges,
  errorMessage,
  onBioChange,
  onReset,
  onSave,
}: Props) {
  return (
    <section className="app-settings-section overflow-hidden rounded-[30px] p-5 sm:p-6">
      <div className="app-settings-kicker flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase">
        <PenSquare className="h-4.5 w-4.5" strokeWidth={1.95} />
        Bio
      </div>

      <h3 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        Update bio
      </h3>
      <p className="mt-2 text-[15px] leading-[1.7] tracking-[-0.03em] text-(--app-text-muted)">
        Add a short public summary for the profile hero block.
      </p>

      <div className="mt-5">
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
        <Button
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="min-h-10 rounded-xl px-4 text-[13px]"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </section>
  );
}
