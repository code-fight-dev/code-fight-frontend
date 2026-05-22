"use client";

import Link from "next/link";
import { LogOut, Trophy } from "lucide-react";

export function ArenaMatchFinishedOverlay() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-finished-title"
      className="arena-accept-overlay fixed inset-0 z-60 flex items-center justify-center px-4"
    >
      <div className="arena-accept-backdrop absolute inset-0" />
      <div className="arena-accept-modal relative w-full max-w-xl rounded-3xl px-6 py-7 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-500/12 px-3 py-1 text-[12px] font-semibold text-emerald-100">
          <Trophy className="h-3.5 w-3.5" />
          Match finished
        </div>
        <h3
          id="arena-finished-title"
          className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-(--app-text-strong)"
        >
          Final score is locked
        </h3>
        <p className="mt-2 text-[15px] leading-7 text-(--app-text-muted)">
          The duel has ended. You can return to matchmaking and look for another match.
        </p>

        <Link
          href="/arena"
          className="arena-accept-button mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-[14px] font-semibold"
        >
          <LogOut className="h-4.5 w-4.5" />
          Leave match room
        </Link>
      </div>
    </div>
  );
}
