export function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex animate-pulse items-start gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-surface" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3 w-24 rounded bg-surface" />
            <div className="h-3 w-2/3 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}
