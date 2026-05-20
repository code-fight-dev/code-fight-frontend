"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useArenaMatchmaking } from "@/features/arena-matchmaking";
import { buildArenaMatchHref } from "@/shared/config/routes";
import { Container } from "@/shared/ui/Container";
import { Toast } from "@/shared/ui/Toast";
import type { ArenaPageData } from "../model/getArenaPageData";
import { ArenaAcceptOverlay } from "./ArenaAcceptOverlay";
import { ArenaHero } from "./ArenaHero";
import { ArenaQueueCtaPanel } from "./ArenaQueueCtaPanel";
import { ArenaQueueSettingsCard } from "./ArenaQueueSettingsCard";
import { ArenaStatsCards } from "./ArenaStatsCards";
import { ArenaUserCard } from "./ArenaUserCard";

type Props = {
  data: ArenaPageData;
};

export function ArenaPageView({ data }: Props) {
  const router = useRouter();
  const {
    state,
    queueSettings,
    runningMatchId,
    searchElapsedSeconds,
    acceptRemainingSeconds,
    isSseConnected,
    isBusy,
    isGuest,
    selfAccepted,
    opponentAccepted,
    errorMessage,
    toastMessage,
    setTaskMode,
    setIsRated,
    startMatchmaking,
    cancelMatchmaking,
    acceptMatch,
    clearToast,
  } = useArenaMatchmaking();

  useEffect(() => {
    if (!runningMatchId) {
      return;
    }

    router.push(buildArenaMatchHref(runningMatchId));
  }, [router, runningMatchId]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearToast();
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearToast, toastMessage]);

  const isSearching = state === "searching";
  const isQueueSettingsLocked = isSearching;
  const isAcceptOverlayVisible =
    state === "pending_accept" || state === "accepting" || state === "waiting_opponent";

  return (
    <section className="arena-page relative min-h-[calc(100vh-5rem)] overflow-hidden py-12 sm:py-16 lg:py-24">
      <Toast message={toastMessage} />

      <div
        aria-hidden
        className="app-motion-decorative arena-grid-layer challenge-grid-layer pointer-events-none absolute inset-0 opacity-62"
      />
      <div
        aria-hidden
        className="app-motion-decorative pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.1)_0%,rgba(8,12,24,0.36)_100%)]"
      />

      <Container className="relative">
        <div className="mx-auto w-full" style={{ maxWidth: "1320px" }}>
          <ArenaHero />
          <ArenaStatsCards stats={data.stats} />

          <div className="mt-7 grid gap-4 xl:grid-cols-[21rem_minmax(0,1fr)]">
            <aside className="grid gap-3.5">
              <ArenaUserCard viewer={data.viewer} isGuest={isGuest} />
              <ArenaQueueSettingsCard
                queueSettings={queueSettings}
                isLocked={isQueueSettingsLocked}
                setTaskMode={setTaskMode}
                setIsRated={setIsRated}
              />
            </aside>

            <ArenaQueueCtaPanel
              isGuest={isGuest}
              state={state}
              queueSettings={queueSettings}
              searchElapsedSeconds={searchElapsedSeconds}
              isSseConnected={isSseConnected}
              isBusy={isBusy}
              errorMessage={errorMessage}
              onStart={() => {
                void startMatchmaking();
              }}
              onCancel={() => {
                void cancelMatchmaking();
              }}
            />
          </div>
        </div>
      </Container>

      <ArenaAcceptOverlay
        visible={isAcceptOverlayVisible}
        acceptRemainingSeconds={acceptRemainingSeconds}
        selfAccepted={selfAccepted}
        opponentAccepted={opponentAccepted}
        isBusy={isBusy}
        onAccept={() => {
          void acceptMatch();
        }}
      />
    </section>
  );
}
