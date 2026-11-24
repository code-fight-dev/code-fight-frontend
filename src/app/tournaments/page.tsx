import { TournamentList } from "@/features/tournament-play/TournamentList";
import { Container } from "@/shared/ui/Container";

export default function TournamentsPage() {
  return (
    <section className="py-16">
      <Container>
        <h1 className="mb-8 text-3xl font-semibold">Tournaments</h1>
        <TournamentList />
      </Container>
    </section>
  );
}
