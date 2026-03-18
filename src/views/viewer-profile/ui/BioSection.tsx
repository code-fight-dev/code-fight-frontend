type Props = {
  value: string;
  isEditable: boolean;
  isSaving: boolean;
  onChange: (value: string) => void;
};

const BIO_LIMIT = 255;

export function BioSection({ value, isEditable, isSaving, onChange }: Props) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="font-accent text-[11px] tracking-[0.22em] text-blue-300/78 uppercase">
          Bio
        </div>
        <div className="text-[12px] tracking-[-0.02em] text-(--app-text-faint)">
          {value.length}/{BIO_LIMIT}
        </div>
      </div>

      {isEditable ? (
        <textarea
          value={value}
          maxLength={BIO_LIMIT}
          disabled={isSaving}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tell other coders what you enjoy building and competing with."
          className="app-input-surface min-h-34 w-full resize-y rounded-3xl px-4 py-4 text-[15px] leading-[1.72] tracking-[-0.025em] transition-[border-color,box-shadow,background-color] duration-200 outline-none focus:border-(--app-input-focus-border) focus:bg-(--app-surface-input-focus) focus:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_12px_30px_rgba(3,7,18,0.12)]"
        />
      ) : (
        <div className="rounded-3xl border border-white/8 bg-white/4 px-4 py-4 text-[15px] leading-[1.78] tracking-[-0.025em] text-(--app-text-muted)">
          {value || "No bio added yet."}
        </div>
      )}
    </div>
  );
}
