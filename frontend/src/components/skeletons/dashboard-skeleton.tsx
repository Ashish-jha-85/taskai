import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-4 w-72 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
