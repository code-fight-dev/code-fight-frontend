type Props = {
  onClick: () => void;
};

export function LeaderboardJumpToMeButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex h-8 items-center rounded-md border border-slate-300/40 bg-slate-300/10 px-2.5 text-[11px] font-semibold tracking-[0.12em] text-slate-100 uppercase transition-colors hover:border-slate-200/55 hover:bg-slate-200/14 sm:absolute sm:top-1/2 sm:right-4 sm:mt-0 sm:-translate-y-1/2"
    >
      Jump to me
    </button>
  );
}
