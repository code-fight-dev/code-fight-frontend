import { Loader2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import {
  PROGRAMMING_LANGUAGE_BY_ID,
  type Challenge,
  type ChallengeLanguage,
  type TaskSubmission,
} from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";
import { Select, type SelectOption } from "@/shared/ui/Select";
import { ArenaCodeEditorPanel } from "./ArenaCodeEditorPanel";
import { ArenaRoomConsolePanel } from "./ArenaRoomConsolePanel";
import { ArenaRoomTestcasePanel } from "./ArenaRoomTestcasePanel";

type ArenaRoomWorkspaceTab = "testcases" | "console";

type Props = {
  challenge: Challenge;
  selectedLanguage: ChallengeLanguage;
  currentCode: string;
  submissionStatus: "idle" | "running" | "submitted" | "error";
  outputMessage: string;
  activeWorkspaceTab: ArenaRoomWorkspaceTab;
  ownSubmission: TaskSubmission | null;
  isSubmitting: boolean;
  setActiveWorkspaceTab: (tab: ArenaRoomWorkspaceTab) => void;
  setSelectedLanguage: (language: ChallengeLanguage) => void;
  setCurrentCode: (value: string) => void;
  submitSolution: () => Promise<void>;
};

export function ArenaRoomWorkspaceShell({
  challenge,
  selectedLanguage,
  currentCode,
  submissionStatus,
  outputMessage,
  activeWorkspaceTab,
  ownSubmission,
  isSubmitting,
  setActiveWorkspaceTab,
  setSelectedLanguage,
  setCurrentCode,
  submitSolution,
}: Props) {
  const [activeTestcaseIndex, setActiveTestcaseIndex] = useState(0);

  const languageOptions = useMemo(
    () =>
      challenge.supportedLanguages.map((language) => ({
        value: language,
        label: PROGRAMMING_LANGUAGE_BY_ID[language].label,
      })) as SelectOption<ChallengeLanguage>[],
    [challenge.supportedLanguages],
  );

  const selectedLanguageMeta = PROGRAMMING_LANGUAGE_BY_ID[selectedLanguage];

  return (
    <section className="challenge-panel flex min-h-136 flex-col overflow-hidden rounded-xl">
      <div className="challenge-panel-header flex flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4">
        <div className="inline-flex items-center gap-2">
          <span className="text-[12px] font-semibold text-(--app-text-faint)">
            Language
          </span>
          <Select
            aria-label="Match language"
            value={selectedLanguage}
            options={languageOptions}
            onValueChange={setSelectedLanguage}
            surface="challenge"
            controlSize="sm"
            className="font-semibold"
          />
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void submitSolution()}
          className={cn(
            "challenge-focus-ring arena-room-submit inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold disabled:pointer-events-none disabled:opacity-65",
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit
        </button>
      </div>

      <ArenaCodeEditorPanel
        language={selectedLanguageMeta.monacoLanguage}
        value={currentCode}
        fileName={`solution.${selectedLanguageMeta.extension}`}
        onChange={setCurrentCode}
      />

      {activeWorkspaceTab === "testcases" ? (
        <ArenaRoomTestcasePanel
          challenge={challenge}
          activeWorkspaceTab={activeWorkspaceTab}
          activeTestcaseIndex={activeTestcaseIndex}
          setActiveWorkspaceTab={setActiveWorkspaceTab}
          setActiveTestcaseIndex={setActiveTestcaseIndex}
        />
      ) : (
        <div className="border-t border-(--app-surface-soft-border) bg-(--app-option-bg) p-3 sm:p-4">
          <div className="mb-3 flex gap-1.5 rounded-lg border border-(--app-option-border) bg-(--app-option-bg) p-1.5">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab("testcases")}
              className="h-8 flex-1 rounded-md px-3 text-[13px] font-semibold text-(--app-text-muted) transition-colors hover:bg-(--app-control-secondary-hover-bg) hover:text-(--app-text-strong) focus:outline-none"
            >
              Testcases
            </button>
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab("console")}
              className="h-8 flex-1 rounded-md bg-(--app-option-active-bg) px-3 text-[13px] font-semibold text-(--app-text-strong) transition-colors focus:outline-none"
            >
              Console
            </button>
          </div>
          <ArenaRoomConsolePanel
            isSubmitting={isSubmitting}
            ownSubmission={ownSubmission}
            outputMessage={outputMessage}
            submissionStatus={submissionStatus}
          />
        </div>
      )}
    </section>
  );
}
