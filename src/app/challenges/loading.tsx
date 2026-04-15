import { Container } from "@/shared/ui/Container";

export default function ChallengesLoading() {
  return (
    <section className="challenge-page py-8 sm:py-10 lg:py-12">
      <Container>
        <div className="challenge-panel-soft h-40 animate-pulse rounded-lg" />
        <div className="mt-5 grid gap-3">
          <div className="challenge-panel-muted h-18 animate-pulse rounded-lg" />
          <div className="challenge-panel-muted h-18 animate-pulse rounded-lg" />
          <div className="challenge-panel-muted h-18 animate-pulse rounded-lg" />
        </div>
      </Container>
    </section>
  );
}
