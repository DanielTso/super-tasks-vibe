import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col h-full bg-black/10 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="mojave-glass p-4 rounded-xl border border-border h-32">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export { Skeleton, KanbanSkeleton }
