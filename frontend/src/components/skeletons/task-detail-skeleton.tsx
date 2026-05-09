import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TaskDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-10 w-80 rounded-full" />
        <Skeleton className="h-4 w-56 rounded-full" />
      </div>

      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CardContent className="grid gap-6 pt-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
