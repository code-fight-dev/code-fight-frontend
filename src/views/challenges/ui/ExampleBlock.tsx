import type { ChallengeExample } from "@/entities/challenge";

type Props = {
  example: ChallengeExample;
  index: number;
};

export function ExampleBlock({ example, index }: Props) {
  return (
    <section className="challenge-panel-muted rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-(--app-text-strong)">
          Example {index + 1}: {example.title}
        </h3>
      </div>

      <div className="mt-3 grid gap-3">
        <div>
          <div className="text-[12px] font-semibold text-(--app-text-faint)">Input</div>
          <pre className="challenge-code-block font-accent mt-1 overflow-x-auto rounded-md p-3 text-[13px] leading-6">
            <code>{example.input}</code>
          </pre>
        </div>

        <div>
          <div className="text-[12px] font-semibold text-(--app-text-faint)">Output</div>
          <pre className="challenge-code-block challenge-code-block-output font-accent mt-1 overflow-x-auto rounded-md p-3 text-[13px] leading-6">
            <code>{example.output}</code>
          </pre>
        </div>
      </div>

      {example.explanation ? (
        <p className="mt-3 text-[13px] leading-6 text-(--app-text-muted)">
          {example.explanation}
        </p>
      ) : null}
    </section>
  );
}
