import Link from "next/link";
import { TournamentBoardView } from "@/features/tournament-play/TournamentBoardView";
import { Container } from "@/shared/ui/Container";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <section className="py-16">
      <Container>
        <Link href="/tournaments" className="mb-6 inline-block underline">
          All tournaments
        </Link>
        <TournamentBoardView id={id} />
      </Container>
    </section>
  );
}
