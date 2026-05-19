import { MenuSkeleton } from './_components/menu-skeleton'

export default function MenuLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full">
        <MenuSkeleton />
      </main>
    </div>
  )
}
