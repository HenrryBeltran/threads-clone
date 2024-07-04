export function ThreadsSkeleton() {
  const thread = (delay: number) => (
    <div style={{ "--skeleton-delay": `${delay}ms` } as React.CSSProperties} className="flex gap-3">
      <div className="h-11 w-11 animate-pulse rounded-full bg-muted-foreground/20 [animation-delay:var(--skeleton-delay)]" />
      <div className="flex-grow space-y-2">
        <div className="h-7 w-11/12 animate-pulse rounded-2xl bg-muted-foreground/20 [animation-delay:var(--skeleton-delay)]" />
        <div className="h-7 w-full animate-pulse rounded-2xl bg-muted-foreground/20 [animation-delay:var(--skeleton-delay)]" />
        <div className="h-7 w-2/5 animate-pulse rounded-2xl bg-muted-foreground/20 [animation-delay:var(--skeleton-delay)]" />
      </div>
    </div>
  );

  return (
    <div className="mt-3 space-y-12">
      {thread(0)}
      {thread(200)}
      {thread(400)}
      {thread(600)}
      {thread(800)}
      {thread(1000)}
    </div>
  );
}
