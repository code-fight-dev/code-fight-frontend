type Props = {
  constraints: string[];
};

export function ConstraintList({ constraints }: Props) {
  return (
    <section>
      <h2 className="text-[16px] font-semibold text-(--app-text-strong)">Constraints</h2>
      <ul className="mt-3 grid gap-2">
        {constraints.map((constraint) => (
          <li
            key={constraint}
            className="challenge-panel-muted font-accent rounded-md px-3 py-2 text-[12px] leading-6 text-(--app-text-muted)"
          >
            {constraint}
          </li>
        ))}
      </ul>
    </section>
  );
}
