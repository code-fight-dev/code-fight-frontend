import { Container } from "@/shared/ui/Container";
import type { StatusPageData } from "../model/types";
import { StatusComponentsGrid } from "./StatusComponentsGrid";
import { StatusIncidentsSection } from "./StatusIncidentsSection";
import { StatusOverviewCard } from "./StatusOverviewCard";
import { StatusPageHero } from "./StatusPageHero";
import { statusPageClassNames } from "./statusPageStyles";

type Props = {
  data: StatusPageData;
};

export function StatusPageView({ data }: Props) {
  return (
    <main className={statusPageClassNames.root}>
      <div aria-hidden className={statusPageClassNames.gridLayer} />
      <div aria-hidden className={statusPageClassNames.gridFade} />
      <div aria-hidden className={statusPageClassNames.primaryGlow} />
      <div aria-hidden className={statusPageClassNames.secondaryGlow} />

      <Container className={statusPageClassNames.content}>
        <StatusPageHero />

        <StatusOverviewCard
          isAvailable={data.isAvailable}
          indicator={data.indicator}
          indicatorDescription={data.indicatorDescription}
          sourceName={data.sourceName}
          publicStatusPageUrl={data.publicStatusPageUrl}
        />

        <StatusComponentsGrid components={data.components} />
        <StatusIncidentsSection incidents={data.incidents} />
      </Container>
    </main>
  );
}
