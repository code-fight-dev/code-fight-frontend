"use client";

import { BookOpen, FileCode2, History } from "lucide-react";
import type { Challenge, TaskSubmissionSummary } from "@/entities/challenge";
import { cn } from "@/shared/lib/cn";
import { getChallengeLanguageScope } from "../model/presentation";
import type { ChallengeProblemTab } from "../model/workspace";
import { ChallengeTopics } from "./ChallengeTopics";
import { ConstraintList } from "./ConstraintList";
import { DifficultyBadge } from "./DifficultyBadge";
import { ExampleBlock } from "./ExampleBlock";

const PROBLEM_TABS: Array<{
  value: ChallengeProblemTab;
  label: string;
  icon: typeof BookOpen;
}> = [
  { value: "description", label: "Description", icon: BookOpen },
  { value: "editorial", label: "Editorial", icon: FileCode2 },
  { value: "submissions", label: "Submissions", icon: History },
];

type Props = {
  challenge: Challenge;
  activeTab: ChallengeProblemTab;
  submissions: TaskSubmissionSummary[];
  onTabChange: (tab: ChallengeProblemTab) => void;
};

function toReadableLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function formatSubmissionDate(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function ChallengeProblemPanel({
  challenge,
  activeTab,
  submissions,
  onTabChange,
}: Props) {
  return (
    <section className="challenge-panel flex min-h-136 flex-col overflow-hidden rounded-lg">
      <div className="challenge-panel-header border-b p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <span className="challenge-panel-muted inline-flex h-7 items-center rounded-md px-2.5 text-[12px] font-semibold text-(--app-text-soft)">
            {challenge.category}
          </span>
          <span className="challenge-panel-muted inline-flex h-7 items-center rounded-md px-2.5 text-[12px] font-semibold text-(--app-text-soft)">
            {getChallengeLanguageScope(challenge.kind)}
          </span>
          <span className="challenge-panel-muted inline-flex h-7 items-center rounded-md px-2.5 text-[12px] font-semibold text-(--app-text-soft)">
            {challenge.estimatedMinutes} min
          </span>
        </div>

        <h1 className="mt-4 text-[1.85rem] leading-tight font-semibold text-(--app-text-strong) sm:text-[2.2rem]">
          {challenge.title}
        </h1>
        <p className="mt-3 text-[14px] leading-7 text-(--app-text-muted)">
          {challenge.summary}
        </p>

        <ChallengeTopics challenge={challenge} className="mt-4 gap-2" />
      </div>

      <div className="flex border-b border-(--app-surface-soft-border) bg-(--app-option-bg) p-1.5">
        {PROBLEM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70",
                isActive
                  ? "bg-(--app-option-active-bg) text-(--app-text-strong)"
                  : "text-(--app-text-muted) hover:bg-(--app-control-secondary-hover-bg) hover:text-(--app-text-strong)",
              )}
            >
              <Icon aria-hidden className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === "description" ? (
          <div className="grid gap-6">
            <section className="grid gap-4">
              {challenge.description.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[15px] leading-8 text-(--app-text-muted)"
                >
                  {paragraph}
                </p>
              ))}
            </section>

            <section className="grid gap-3">
              <h2 className="text-[16px] font-semibold text-(--app-text-strong)">
                Examples
              </h2>
              {challenge.examples.map((example, index) => (
                <ExampleBlock key={example.title} example={example} index={index} />
              ))}
            </section>

            <ConstraintList constraints={challenge.constraints} />

            {challenge.notes?.length ? (
              <section>
                <h2 className="text-[16px] font-semibold text-(--app-text-strong)">
                  Notes
                </h2>
                <ul className="mt-3 grid gap-2">
                  {challenge.notes.map((note) => (
                    <li
                      key={note}
                      className="rounded-md border border-(--app-option-active-border) bg-(--app-option-active-bg) px-3 py-2 text-[13px] leading-6 text-(--app-text-muted)"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        {activeTab === "editorial" ? (
          <section className="challenge-panel-muted rounded-lg border-dashed p-6">
            <h2 className="text-[18px] font-semibold text-(--app-text-strong)">
              Editorial locked
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-7 text-(--app-text-muted)">
              Solve the problem first, then compare approaches, edge cases, and complexity
              notes here.
            </p>
          </section>
        ) : null}

        {activeTab === "submissions" ? (
          submissions.length === 0 ? (
            <section className="challenge-panel-muted rounded-lg border-dashed p-6">
              <h2 className="text-[18px] font-semibold text-(--app-text-strong)">
                No submissions yet
              </h2>
              <p className="mt-2 max-w-xl text-[14px] leading-7 text-(--app-text-muted)">
                No accepted runs or failed attempts have been recorded for this challenge.
              </p>
            </section>
          ) : (
            <div className="grid gap-3">
              {submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="challenge-panel-muted rounded-lg border px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold tracking-[0.04em] text-(--app-text-faint) uppercase">
                      {formatSubmissionDate(submission.createdAt)}
                    </span>
                    <span className="text-[12px] font-semibold text-(--app-text-soft)">
                      {submission.language.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-2 text-[13px] text-(--app-text-muted)">
                    Status:{" "}
                    <span className="font-semibold text-(--app-text-strong)">
                      {toReadableLabel(submission.status)}
                    </span>
                    {submission.verdict ? (
                      <>
                        {" | "}Verdict:{" "}
                        <span className="font-semibold text-(--app-text-strong)">
                          {toReadableLabel(submission.verdict)}
                        </span>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-1 text-[13px] text-(--app-text-muted)">
                    Passed:{" "}
                    <span className="font-semibold text-(--app-text-strong)">
                      {submission.passedTests}/{submission.totalTests}
                    </span>
                    {" | "}Runtime:{" "}
                    <span className="font-semibold text-(--app-text-strong)">
                      {typeof submission.runTimeMs === "number"
                        ? `${submission.runTimeMs} ms`
                        : "n/a"}
                    </span>
                  </div>

                  {submission.errorMessage ? (
                    <p className="mt-2 text-[13px] text-rose-200/95">
                      {submission.errorMessage}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
