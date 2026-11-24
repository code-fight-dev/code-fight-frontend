"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  changeTournamentStatus,
  getTournamentBoard,
  joinTournament,
  scheduleTournamentMatch,
  type TournamentBoard,
} from "@/entities/tournament";
import { useViewerSession } from "@/entities/viewer";
import { managementErrorMessage } from "@/shared/api/management";
import { Button } from "@/shared/ui/Button";

export function TournamentBoardView({ id }: { id: string }) {
  const { viewer, isLoading } = useViewerSession();
  const [board, setBoard] = useState<TournamentBoard | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getTournamentBoard(id, controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) setBoard(next);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(managementErrorMessage(error));
      });
    return () => controller.abort();
  }, [id, revision]);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      setBoard(await getTournamentBoard(id));
    } catch (error) {
      setError(managementErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (!board)
    return error ? <p role="alert">{error}</p> : <p role="status">Loading tournament…</p>;

  const { tournament, standings, fixtures } = board;
  const registered = standings.some((entry) => entry.userId === viewer?.id);
  const canManage =
    viewer?.role === "admin" ||
    (viewer?.role === "organizer" && viewer.id === tournament.ownerId);

  return (
    <div aria-busy={busy} className="grid gap-8">
      <header>
        <h1 className="text-4xl font-semibold">{tournament.title}</h1>
        {tournament.description && (
          <p className="mt-3 whitespace-pre-wrap">{tournament.description}</p>
        )}
        <p className="mt-3 capitalize">
          {tournament.status === "published" ? "Registration open" : tournament.status}
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        {tournament.status === "published" &&
          (registered ? (
            <span>Registered</span>
          ) : viewer ? (
            <Button disabled={busy} onClick={() => void act(() => joinTournament(id))}>
              Join tournament
            </Button>
          ) : (
            !isLoading && (
              <Link href="/signin" className="underline">
                Sign in to join
              </Link>
            )
          ))}
        {canManage && tournament.status === "published" && (
          <Button
            disabled={busy || standings.length < 2}
            onClick={() =>
              void act(() =>
                changeTournamentStatus(id, "running", tournament.configVersion),
              )
            }
          >
            Close registration and start
          </Button>
        )}
        {canManage && tournament.status === "running" && (
          <Button
            disabled={busy || fixtures.some((fixture) => fixture.status !== "finished")}
            onClick={() =>
              void act(() =>
                changeTournamentStatus(id, "completed", tournament.configVersion),
              )
            }
          >
            Finalize tournament
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => {
            setError("");
            setRevision((value) => value + 1);
          }}
        >
          Refresh results
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      <section className="app-surface overflow-x-auto rounded-2xl p-5">
        <h2 className="mb-4 text-xl font-semibold">Standings</h2>
        {standings.length === 0 ? (
          <p>No players have registered.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th>Player</th>
                <th>Played</th>
                <th>Wins</th>
                <th>Draws</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((entry) => (
                <tr
                  key={entry.userId}
                  className="border-t border-(--app-control-secondary-border)"
                >
                  <th scope="row" className="py-2 font-medium">
                    {entry.username}
                  </th>
                  <td>{entry.played}</td>
                  <td>{entry.wins}</td>
                  <td>{entry.draws}</td>
                  <td>{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      {fixtures.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Matches</h2>
          <ul className="grid gap-3">
            {fixtures.map((fixture) => (
              <li
                key={fixture.id}
                className="app-surface flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
              >
                <span>
                  {fixture.player1} vs {fixture.player2}{" "}
                  <span className="ml-2 text-sm capitalize">{fixture.status}</span>
                </span>
                {fixture.matchId &&
                  (viewer?.username === fixture.player1 ||
                    viewer?.username === fixture.player2) &&
                  (fixture.status === "pending" || fixture.status === "running") && (
                    <Link href={"/arena/match/" + fixture.matchId} className="underline">
                      Open match
                    </Link>
                  )}
                {canManage &&
                  tournament.status === "running" &&
                  (fixture.status === "unscheduled" ||
                    fixture.status === "cancelled") && (
                    <Button
                      disabled={busy}
                      onClick={() =>
                        void act(() => scheduleTournamentMatch(id, fixture.id))
                      }
                    >
                      Schedule match
                    </Button>
                  )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
