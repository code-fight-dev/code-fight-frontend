import { cn } from "@/shared/lib/cn";
import { WORKSPACE_TABS, type WorkspaceTab } from "../model/workspace";

type Props = {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
};

export function ChallengeWorkspaceTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="mb-3 flex gap-1.5 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) p-1.5">
      {WORKSPACE_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "h-8 flex-1 rounded-md px-3 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70",
            activeTab === tab.value
              ? "bg-(--app-option-active-bg) text-(--app-text-strong)"
              : "text-(--app-text-muted) hover:bg-(--app-control-secondary-hover-bg) hover:text-(--app-text-strong)",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
