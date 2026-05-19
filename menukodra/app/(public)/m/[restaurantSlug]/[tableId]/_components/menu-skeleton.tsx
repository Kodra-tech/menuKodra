function ItemCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex gap-3 p-3">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
        <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
        <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse mt-3" />
      </div>
      <div className="w-24 h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
    </div>
  )
}

export function MenuSkeleton() {
  return (
    <div>
      {/* Category tabs skeleton */}
      <div className="sticky top-[69px] z-30 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex overflow-x-auto px-4 gap-2 py-2">
          {[88, 112, 72, 96, 80].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      {/* Item card skeletons */}
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
