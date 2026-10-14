import { isRecord, managementRequest } from "@/shared/api/management";
import { withRequestDeadline } from "@/shared/api/requestDeadline";
import { isTournamentDraft } from "../model/types";
import type { DraftInput, DraftPage } from "../model/types";

function readDraft(body: unknown) {
  if (!isRecord(body) || !isTournamentDraft(body.tournament))
    throw new Error("Invalid tournament response");
  return body.tournament;
}

export async function listTournamentDrafts(
  cursor?: string,
  signal?: AbortSignal,
): Promise<DraftPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const body = await managementRequest(`/organizer/tournaments${query}`, { signal });
  if (
    !isRecord(body) ||
    !Array.isArray(body.items) ||
    !body.items.every(isTournamentDraft) ||
    (body.nextCursor !== undefined && typeof body.nextCursor !== "string")
  )
    throw new Error("Invalid tournament list response");
  return { items: body.items, nextCursor: body.nextCursor };
}

export async function getTournamentDraft(id: string, signal?: AbortSignal) {
  return readDraft(
    await managementRequest(`/organizer/tournaments/${encodeURIComponent(id)}`, {
      signal,
    }),
  );
}

export async function findTournamentDraftBySlug(
  slug: string,
  callerSignal?: AbortSignal,
) {
  return withRequestDeadline(async (signal) => {
    let cursor: string | undefined;
    const cursors = new Set<string>();
    do {
      const page = await listTournamentDrafts(cursor, signal);
      const draft = page.items.find((item) => item.slug === slug.trim().toLowerCase());
      if (draft) return draft;
      cursor = page.nextCursor;
      if (cursor && cursors.has(cursor))
        throw new Error("Unable to check the draft list.");
      if (cursor) cursors.add(cursor);
    } while (cursor);
    return null;
  }, callerSignal);
}

export async function createTournamentDraft(input: DraftInput, signal?: AbortSignal) {
  return readDraft(
    await managementRequest("/organizer/tournaments", {
      method: "POST",
      body: input,
      signal,
    }),
  );
}

export async function updateTournamentDraft(
  id: string,
  input: DraftInput,
  expectedConfigVersion: number,
  signal?: AbortSignal,
) {
  return readDraft(
    await managementRequest(`/organizer/tournaments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { ...input, expectedConfigVersion },
      signal,
    }),
  );
}
