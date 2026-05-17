import type { Challenge } from "@/entities/challenge";

type Props = {
  challenge: Challenge;
};

export function ArenaRoomProblemPanel({ challenge }: Props) {
  return (
    <section className="challenge-panel flex min-h-136 flex-col overflow-hidden rounded-xl">
      <div className="challenge-panel-header border-b p-4 sm:p-5">
        <h1 className="text-[1.8rem] leading-tight font-semibold tracking-[-0.03em] text-(--app-text-strong)">
          {challenge.title}
        </h1>
        <p className="mt-2 text-[14px] leading-7 text-(--app-text-muted)">
          {challenge.summary}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="grid gap-5">
          <section className="grid gap-3">
            {challenge.description.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[15px] leading-8 text-(--app-text-muted)"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <section className="grid gap-3">
            <h2 className="text-[16px] font-semibold text-(--app-text-strong)">
              Examples
            </h2>
            {challenge.examples.map((example, index) => (
              <article
                key={example.title}
                className="challenge-panel-muted rounded-lg border px-3 py-2.5"
              >
                <h3 className="text-[13px] font-semibold text-(--app-text-strong)">
                  Example {index + 1}: {example.title}
                </h3>
                <div className="mt-2 grid gap-2 text-[13px] text-(--app-text-muted)">
                  <pre className="challenge-code-block font-accent rounded-md p-2.5 whitespace-pre-wrap">
                    Input: {example.input}
                  </pre>
                  <pre className="challenge-code-block font-accent rounded-md p-2.5 whitespace-pre-wrap">
                    Output: {example.output}
                  </pre>
                  {example.explanation ? (
                    <p className="text-[13px] leading-6">{example.explanation}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-(--app-text-strong)">
              Constraints
            </h2>
            <ul className="mt-3 grid gap-2">
              {challenge.constraints.map((constraint) => (
                <li
                  key={constraint}
                  className="challenge-panel-muted rounded-lg border px-3 py-2 text-[13px] text-(--app-text-muted)"
                >
                  {constraint}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
