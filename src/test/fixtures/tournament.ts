import type { TournamentDraft } from "@/entities/tournament";

export function createTournamentDraftFixture(
  overrides: Partial<TournamentDraft> = {},
): TournamentDraft {
  return {
    id: "draft-id",
    title: "Autumn Cup",
    slug: "autumn-cup",
    description: "",
    ownerId: "owner-id",
    createdBy: "owner-id",
    status: "draft",
    configVersion: 1,
    createdAt: "2026-10-04T10:00:00Z",
    updatedAt: "2026-10-04T10:00:00Z",
    ...overrides,
  };
}
