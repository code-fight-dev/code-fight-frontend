import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { canOrganizeTournaments } from "@/entities/viewer";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { TournamentManagementPanel } from "@/features/tournament-management";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = {
  title: "Manage tournaments | CodeFight",
  robots: { index: false, follow: false },
};

export default async function OrganizerTournamentsPage() {
  const viewer = await getCurrentViewerServer();
  if (!viewer) redirect("/signin");
  if (!canOrganizeTournaments(viewer.role)) notFound();
  return (
    <section className="py-16">
      <Container>
        <h1 className="mb-8 text-3xl font-semibold text-(--app-text-strong)">
          Manage tournaments
        </h1>
        <TournamentManagementPanel />
      </Container>
    </section>
  );
}
