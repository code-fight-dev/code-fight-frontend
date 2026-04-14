"use client";

type Props = Readonly<{
  isDefault: boolean;
  onReset: () => void;
}>;

export function EditorSettingsHeader({ isDefault, onReset }: Props) {
  return (
    <section className="flex flex-col gap-4 px-1 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <p className="app-settings-kicker text-[11px] font-semibold tracking-[0.24em] uppercase">
          Editor
        </p>

        <h1 className="mt-2 text-xl font-semibold text-(--app-text-strong) sm:text-2xl">
          Monaco workspace preferences
        </h1>

        <p className="mt-3 text-sm leading-6 text-(--app-text-muted)">
          Adjust editor behavior, typography, spacing, and visual comfort for practice
          sessions.
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        disabled={isDefault}
        className="w-full rounded-2xl border border-(--app-option-border) bg-(--app-option-bg) px-4 py-2.5 text-sm font-semibold text-(--app-text-strong) transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Reset defaults
      </button>
    </section>
  );
}
