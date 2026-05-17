import { cn } from "@/shared/lib/cn";
import type { Challenge } from "@/entities/challenge";

type ArenaRoomWorkspaceTab = "testcases" | "console";

type Props = {
  challenge: Challenge;
  activeWorkspaceTab: ArenaRoomWorkspaceTab;
  activeTestcaseIndex: number;
  setActiveWorkspaceTab: (tab: ArenaRoomWorkspaceTab) => void;
  setActiveTestcaseIndex: (index: number) => void;
};

export function ArenaRoomTestcasePanel({
  challenge,
  activeWorkspaceTab,
  activeTestcaseIndex,
  setActiveWorkspaceTab,
  setActiveTestcaseIndex,
}: Props) {
  const activeTestcase =
    challenge.testCases[activeTestcaseIndex] ?? challenge.testCases[0] ?? null;

  return (
    <div className="border-t border-(--app-surface-soft-border) bg-(--app-option-bg) p-3 sm:p-4">
      <div className="mb-3 flex gap-1.5 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) p-1.5">
        <button
          type="button"
          onClick={() => setActiveWorkspaceTab("testcases")}
          className={cn(
            "h-8 flex-1 rounded-md px-3 text-[13px] font-semibold transition-colors focus:outline-none",
            activeWorkspaceTab === "testcases"
              ? "bg-(--app-option-active-bg) text-(--app-text-strong)"
              : "text-(--app-text-muted) hover:bg-(--app-control-secondary-hover-bg) hover:text-(--app-text-strong)",
          )}
        >
          Testcases
        </button>
        <button
          type="button"
          onClick={() => setActiveWorkspaceTab("console")}
          className={cn(
            "h-8 flex-1 rounded-md px-3 text-[13px] font-semibold transition-colors focus:outline-none",
            activeWorkspaceTab === "console"
              ? "bg-(--app-option-active-bg) text-(--app-text-strong)"
              : "text-(--app-text-muted) hover:bg-(--app-control-secondary-hover-bg) hover:text-(--app-text-strong)",
          )}
        >
          Console
        </button>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {challenge.testCases.map((testCase, index) => (
            <button
              key={testCase.name}
              type="button"
              onClick={() => setActiveTestcaseIndex(index)}
              className={cn(
                "challenge-focus-ring h-8 rounded-md border px-3 text-[12px] font-semibold transition-colors",
                activeTestcaseIndex === index
                  ? "border-(--app-option-active-border) bg-(--app-option-active-bg) text-(--app-text-strong)"
                  : "border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-muted) hover:border-(--app-control-secondary-hover-border) hover:text-(--app-text-strong)",
              )}
            >
              {testCase.name}
            </button>
          ))}
        </div>

        {activeTestcase ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-[12px] font-semibold text-(--app-text-faint)">
                Input
              </div>
              <pre className="challenge-code-block font-accent mt-1 min-h-24 rounded-md p-3 text-[13px] whitespace-pre-wrap">
                <code>{activeTestcase.input}</code>
              </pre>
            </div>
            <div>
              <div className="text-[12px] font-semibold text-(--app-text-faint)">
                Expected output
              </div>
              <pre className="challenge-code-block challenge-code-block-output font-accent mt-1 min-h-24 rounded-md p-3 text-[13px] whitespace-pre-wrap">
                <code>{activeTestcase.expectedOutput}</code>
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-(--app-text-faint)">
            No public testcases for this challenge.
          </p>
        )}
      </div>
    </div>
  );
}
