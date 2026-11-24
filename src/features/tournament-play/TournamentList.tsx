"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listPublishedTournaments,
  type PublishedTournament,
} from "@/entities/tournament";
import { canOrganizeTournaments, useViewerSession } from "@/entities/viewer";
import { managementErrorMessage } from "@/shared/api/management";

export function TournamentList() {
  const { viewer } = useViewerSession();
  const [items, setItems] = useState<PublishedTournament[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listPublishedTournaments(controller.signal)
      .then(setItems)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(managementErrorMessage(error));
      });
    return () => controller.abort();
  }, []);

  return (
    <>
      {viewer && canOrganizeTournaments(viewer.role) && (
        <Link href="/organizer/tournaments" className="mb-6 inline-block underline">
          Manage drafts
        </Link>
      )}
      {error ? (
        <p role="alert">{error}</p>
      ) : items === null ? (
        <p role="status">Loading tournaments…</p>
      ) : items.length === 0 ? (
        <p>No tournaments have been published.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="app-surface rounded-2xl p-5">
              <Link
                href={"/tournaments/" + item.id}
                className="text-xl font-semibold underline"
              >
                {item.title}
              </Link>
              <p className="mt-2 text-sm capitalize">
                {item.status === "published" ? "Registration open" : item.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
