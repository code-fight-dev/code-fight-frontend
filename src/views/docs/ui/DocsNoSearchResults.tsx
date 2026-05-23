type Props = Readonly<{
  query: string;
}>;

export function DocsNoSearchResults({ query }: Props) {
  return (
    <section className="app-shell-card rounded-[30px] px-5 py-8 text-center sm:px-6 sm:py-10">
      <h2 className="text-[1.4rem] font-semibold tracking-[-0.05em] text-(--app-text-strong)">
        No documentation matches
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-[14px] leading-7 text-(--app-text-muted)">
        Nothing found for{" "}
        <span className="text-(--app-text-strong)">&quot;{query}&quot;</span>. Try a
        shorter keyword like <span className="text-(--app-text-strong)">arena</span>,{" "}
        <span className="text-(--app-text-strong)">editor</span>, or{" "}
        <span className="text-(--app-text-strong)">api</span>.
      </p>
    </section>
  );
}
