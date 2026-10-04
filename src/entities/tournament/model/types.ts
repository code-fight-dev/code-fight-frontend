import { isRecord } from "@/shared/api/management";

export type TournamentDraft = {
  id: string;
  slug: string;
  title: string;
  description: string;
  ownerId: string;
  createdBy: string;
  status: "draft";
  configVersion: number;
  createdAt: string;
  updatedAt: string;
};

export type DraftInput = Pick<TournamentDraft, "slug" | "title" | "description">;
export type DraftPage = { items: TournamentDraft[]; nextCursor?: string };

export function isTournamentDraft(value: unknown): value is TournamentDraft {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.ownerId === "string" &&
    typeof value.createdBy === "string" &&
    value.status === "draft" &&
    typeof value.configVersion === "number" &&
    Number.isSafeInteger(value.configVersion) &&
    value.configVersion > 0 &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}
