import Link from "next/link";
import { Reveal } from "@/shared/ui/Reveal";
import type { StatusPageIncident } from "../model/types";
import { statusPageClassNames } from "./statusPageStyles";

type Props = {
  incidents: StatusPageIncident[];
};

export function StatusIncidentsSection({ incidents }: Props) {
  if (!incidents.length) {
    return null;
  }

  return (
    <Reveal delay={240} className="mt-8">
      <section className={statusPageClassNames.incidentsSection}>
        <h2 className="font-accent text-2xl font-semibold tracking-[-0.04em] text-(--app-text-strong)">
          Active incidents
        </h2>

        <div className="mt-5 space-y-4">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={incident.shortlink}
              target="_blank"
              rel="noreferrer"
              className={statusPageClassNames.incidentLink}
            >
              <p className="font-medium text-(--app-text-strong)">{incident.name}</p>
              <p className="mt-1 text-sm text-(--app-text-soft)">
                {incident.status} · {incident.impact}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
