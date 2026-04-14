"use client";

import type { ChallengeTestCase } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";

type Props = {
  testCases: ChallengeTestCase[];
  activeIndex: number;
  customInput: string;
  onActiveIndexChange: (index: number) => void;
  onCustomInputChange: (value: string) => void;
};

export function TestcasePanel({
  testCases,
  activeIndex,
  customInput,
  onActiveIndexChange,
  onCustomInputChange,
}: Props) {
  const activeTestCase = testCases[activeIndex] ?? testCases[0];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {testCases.map((testCase, index) => (
          <button
            key={testCase.name}
            type="button"
            onClick={() => onActiveIndexChange(index)}
            className={cn(
              "challenge-focus-ring h-8 rounded-md border px-3 text-[12px] font-semibold transition-colors",
              activeIndex === index
                ? "border-(--app-option-active-border) bg-(--app-option-active-bg) text-(--app-text-strong)"
                : "border-(--app-option-border) bg-(--app-option-bg) text-(--app-text-muted) hover:border-(--app-control-secondary-hover-border) hover:text-(--app-text-strong)",
            )}
          >
            {testCase.name}
          </button>
        ))}
      </div>

      {activeTestCase ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-[12px] font-semibold text-(--app-text-faint)">Input</div>
            <pre className="challenge-code-block font-accent mt-1 min-h-26 overflow-x-auto rounded-md p-3 text-[13px] leading-6">
              <code>{activeTestCase.input}</code>
            </pre>
          </div>

          <div>
            <div className="text-[12px] font-semibold text-(--app-text-faint)">
              Expected output
            </div>
            <pre className="challenge-code-block challenge-code-block-output font-accent mt-1 min-h-26 overflow-x-auto rounded-md p-3 text-[13px] leading-6">
              <code>{activeTestCase.expectedOutput}</code>
            </pre>
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="text-[12px] font-semibold text-(--app-text-faint)">
          Custom input
        </span>
        <textarea
          value={customInput}
          onChange={(event) => onCustomInputChange(event.target.value)}
          placeholder="Paste custom input for a future run"
          className="challenge-control font-accent mt-1 min-h-24 w-full resize-y rounded-lg p-3 text-[13px] leading-6 transition-colors outline-none"
        />
      </label>
    </div>
  );
}
