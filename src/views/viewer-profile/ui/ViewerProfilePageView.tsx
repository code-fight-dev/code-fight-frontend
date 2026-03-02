import type { ViewerProfile } from "@/entities/viewer";
import { Container } from "@/shared/ui/Container";

type Props = {
  profile: ViewerProfile;
};

export function ViewerProfilePageView({ profile }: Props) {
  return (
    <section className="relative py-28 sm:py-32 lg:py-36">
      <Container>
        <div className="app-shell-card rounded-[28px] px-6 py-10 sm:px-8 sm:py-12">
          <div className="font-accent text-[12px] tracking-[0.2em] text-blue-300/72 uppercase">
            User Profile
          </div>
          <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.06em] text-(--app-text-strong) sm:text-[2.6rem]">
            @{profile.username}
          </h1>
          <p className="mt-3 text-[1rem] tracking-[-0.03em] text-(--app-text-muted) sm:text-[1.08rem]">
            will be done a bit later
          </p>
        </div>
      </Container>
    </section>
  );
}
