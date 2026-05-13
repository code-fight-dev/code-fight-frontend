"use client";

import { AlertTriangle, CheckCircle2, Loader2, Terminal } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { ExecutionStatus } from "../model/workspace";

type Props = {
  status: ExecutionStatus;
  message: string;
};

export function OutputPanel({ status, message }: Props) {
  const isBusy = status === "running";
  const isError = status === "error";

  return (
    <section className="challenge-code-block rounded-lg p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border",
            isError
              ? "border-rose-300/40 bg-rose-300/14 text-rose-100"
              : status === "submitted"
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
                : "border-cyan-300/24 bg-cyan-300/10 text-cyan-100",
          )}
        >
          {isBusy ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : isError ? (
            <AlertTriangle aria-hidden className="h-4 w-4" />
          ) : status === "submitted" ? (
            <CheckCircle2 aria-hidden className="h-4 w-4" />
          ) : (
            <Terminal aria-hidden className="h-4 w-4" />
          )}
        </span>
        <div>
          <h3 className="text-[14px] font-semibold text-(--app-text-strong)">Console</h3>
          <p className="text-[12px] text-(--app-text-faint)">
            {isError ? "Execution failed" : "Awaiting execution"}
          </p>
        </div>
      </div>

      <pre className="challenge-panel-muted font-accent mt-4 min-h-28 rounded-md p-3 text-[13px] leading-6 whitespace-pre-wrap text-(--app-text-muted)">
        {message}
      </pre>
    </section>
  );
}
