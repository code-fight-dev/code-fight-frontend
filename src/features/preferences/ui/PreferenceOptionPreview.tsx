import type { ReactNode } from "react";
import type { PreferencePreviewVariant } from "@/features/preferences/model/definitions";
import { cn } from "@/shared/lib/cn";

type PreferencePreviewShellProps = Readonly<{
  children: ReactNode;
  className: string;
}>;

type Props = Readonly<{
  variant: PreferencePreviewVariant;
}>;

export function PreferenceOptionPreview({ variant }: Props) {
  switch (variant) {
    case "dark-theme":
      return <DarkThemePreview />;
    case "light-theme":
      return <LightThemePreview />;
    case "standard-motion":
      return <StandardMotionPreview />;
    case "reduced-motion":
      return <ReducedMotionPreview />;
  }
}

function PreferencePreviewShell({ children, className }: PreferencePreviewShellProps) {
  return <div className={cn("app-settings-preview-shell", className)}>{children}</div>;
}

function DarkThemePreview() {
  return (
    <PreferencePreviewShell className="border-white/10 bg-[#091120] text-white">
      <div className="border-b border-white/8 px-2.5 py-2">
        <div className="h-1.5 w-10 rounded-full bg-blue-400/75" />
      </div>
      <div className="space-y-2 px-2.5 py-2.5">
        <div className="h-2 rounded-full bg-white/18" />
        <div className="h-2 w-4/5 rounded-full bg-white/10" />
        <div className="flex gap-1.5">
          <span className="h-4 flex-1 rounded-md bg-blue-400/22" />
          <span className="h-4 flex-1 rounded-md bg-white/8" />
        </div>
      </div>
    </PreferencePreviewShell>
  );
}

function LightThemePreview() {
  return (
    <PreferencePreviewShell className="border-slate-200/90 bg-[#f9fbff] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="border-b border-slate-200/80 px-2.5 py-2">
        <div className="h-1.5 w-10 rounded-full bg-blue-500/72" />
      </div>
      <div className="space-y-2 px-2.5 py-2.5">
        <div className="h-2 rounded-full bg-slate-300/90" />
        <div className="h-2 w-4/5 rounded-full bg-slate-200/95" />
        <div className="flex gap-1.5">
          <span className="h-4 flex-1 rounded-md bg-blue-100" />
          <span className="h-4 flex-1 rounded-md bg-slate-100" />
        </div>
      </div>
    </PreferencePreviewShell>
  );
}

function StandardMotionPreview() {
  return (
    <PreferencePreviewShell className="border-white/10 bg-[#0b1324] text-white">
      <div className="relative h-full overflow-hidden rounded-[18px]">
        <span className="absolute top-3 left-3 h-2 w-8 rounded-full bg-blue-400/80" />
        <span className="absolute top-6 left-8 h-2 w-12 rounded-full bg-sky-300/60 blur-[1px]" />
        <span className="absolute top-10 left-14 h-2 w-9 rounded-full bg-white/22 blur-[1px]" />
      </div>
    </PreferencePreviewShell>
  );
}

function ReducedMotionPreview() {
  return (
    <PreferencePreviewShell className="border-white/10 bg-[#0b1324] text-white">
      <div className="flex h-full flex-col justify-center gap-2 px-3">
        <span className="h-2 w-8 rounded-full bg-blue-400/72" />
        <span className="h-2 w-12 rounded-full bg-white/26" />
        <span className="h-2 w-10 rounded-full bg-white/16" />
      </div>
    </PreferencePreviewShell>
  );
}
