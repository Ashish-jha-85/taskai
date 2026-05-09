import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TaskListSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CardContent className="grid gap-4 pt-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>

      <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-4 w-60 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
