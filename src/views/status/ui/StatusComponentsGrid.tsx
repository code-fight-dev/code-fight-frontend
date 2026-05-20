import { Reveal } from "@/shared/ui/Reveal";
import type { StatusPageComponent } from "../model/types";
import { componentStatusVisuals, statusPageClassNames } from "./statusPageStyles";

type Props = {
  components: StatusPageComponent[];
};

export function StatusComponentsGrid({ components }: Props) {
  if (!components.length) {
    return (
      <Reveal delay={120} className="mt-8">
        <section className={statusPageClassNames.emptyState}>
          No component status information available.
        </section>
      </Reveal>
    );
  }

  return (
    <section className={statusPageClassNames.componentsGrid}>
      {components.map((component, index) => {
        const visual = componentStatusVisuals[component.status];

        return (
          <Reveal key={component.id} delay={120 + index * 60}>
            <article className={statusPageClassNames.componentCard}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={statusPageClassNames.componentTitle}>
                    {component.name}
                  </h3>

                  {component.description ? (
                    <p className={statusPageClassNames.componentDescription}>
                      {component.description}
                    </p>
                  ) : null}
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${visual.badgeClassName}`}
                >
                  <span className={`h-2 w-2 rounded-full ${visual.dotClassName}`} />
                  {visual.label}
                </span>
              </div>
            </article>
          </Reveal>
        );
      })}
    </section>
  );
}
