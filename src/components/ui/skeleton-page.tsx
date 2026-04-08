/**
 * Reusable skeleton loading components for dashboard pages.
 * Used in loading.tsx files across the app.
 */

export function SkeletonHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-sm px-4">
      <div className="size-8 rounded-md bg-muted shimmer" />
      <div className="h-4 w-px bg-border mx-2" />
      <div className="h-4 w-24 rounded bg-muted shimmer" />
    </header>
  );
}

export function SkeletonStatsRow({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="h-3 w-20 rounded bg-muted shimmer mb-3" />
          <div className="h-8 w-16 rounded bg-muted shimmer mb-2" />
          <div className="h-3 w-28 rounded bg-muted shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ height = 'h-48' }: { height?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card ${height} shimmer`} />
  );
}

export function SkeletonCardGrid({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-muted shimmer" />
            <div className="h-5 w-16 rounded-full bg-muted shimmer" />
          </div>
          <div className="h-3 w-full rounded bg-muted shimmer" />
          <div className="h-3 w-3/4 rounded bg-muted shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
        {[120, 200, 100, 80, 60].map((w, i) => (
          <div key={i} className="h-3 rounded bg-muted shimmer" style={{ width: w }} />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
          {[120, 200, 100, 80, 60].map((w, j) => (
            <div key={j} className="h-3 rounded bg-muted shimmer" style={{ width: w, opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonTitle() {
  return (
    <div className="space-y-2">
      <div className="h-7 w-48 rounded bg-muted shimmer" />
      <div className="h-4 w-72 rounded bg-muted shimmer" />
    </div>
  );
}

/**
 * Full page skeleton — header + title + stats + content area.
 * Drop-in replacement for any dashboard page loading state.
 */
export function SkeletonDashboardPage() {
  return (
    <>
      <SkeletonHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <SkeletonTitle />
        <SkeletonStatsRow count={4} />
        <SkeletonTable rows={5} />
      </div>
    </>
  );
}

export function SkeletonGridPage() {
  return (
    <>
      <SkeletonHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <SkeletonTitle />
          <div className="h-9 w-28 rounded-lg bg-muted shimmer" />
        </div>
        <SkeletonStatsRow count={3} />
        <SkeletonCardGrid count={6} />
      </div>
    </>
  );
}
