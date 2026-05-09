"use client"

import { Activity, CheckCircle2, Clock3, Plus, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskTable } from "@/components/tasks/task-table"
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
} from "@/hooks/use-tasks"
import { getErrorMessage } from "@/lib/errors"
import { formatCompactNumber } from "@/lib/format"
import { isTaskActive } from "@/lib/task"
import type { Task } from "@/types/task"

export default function DashboardPage() {
  const tasksQuery = useTasksQuery()
  const retryMutation = useCreateTaskMutation()
  const deleteMutation = useDeleteTaskMutation()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data])
  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks])

  const stats = useMemo(
    () => [
      {
        label: "Total",
        value: formatCompactNumber(tasks.length),
        icon: Activity,
      },
      {
        label: "Pending",
        value: formatCompactNumber(tasks.filter(isTaskActive).length),
        icon: Clock3,
      },
      {
        label: "Success",
        value: formatCompactNumber(tasks.filter((task) => task.status === "success").length),
        icon: CheckCircle2,
      },
      {
        label: "Failed",
        value: formatCompactNumber(tasks.filter((task) => task.status === "failed").length),
        icon: XCircle,
      },
    ],
    [tasks]
  )

  const handleRetry = async (task: Task) => {
    setRetryingTaskId(task._id)

    try {
      await retryMutation.mutateAsync({
        title: `${task.title} (Retry)`,
        input: task.input,
        operation: task.operation,
      })
      toast.success("Retry task created.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to retry this task."))
    } finally {
      setRetryingTaskId(null)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setEditOpen(true)
  }

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`)

    if (!confirmed) {
      return
    }

    setDeletingTaskId(task._id)

    try {
      await deleteMutation.mutateAsync(task._id)
      toast.success("Task deleted.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete this task."))
    } finally {
      setDeletingTaskId(null)
    }
  }

  if (tasksQuery.isLoading) {
    return <DashboardSkeleton />
  }

  if (tasksQuery.isError) {
    return (
      <EmptyState
        icon={XCircle}
        title="Dashboard unavailable"
        description="Could not load task data right now."
        action={
          <Button onClick={() => tasksQuery.refetch()} className="rounded-xl">
            Try again
          </Button>
        }
      />
    )
  }

  return (
    <>
      <CreateTaskDialog
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      {editingTask ? (
        <CreateTaskDialog
          key={editingTask._id}
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          initialValues={{
            id: editingTask._id,
            title: editingTask.title,
            input: editingTask.input,
            operation: editingTask.operation,
          }}
          onSaved={() => setEditingTask(null)}
        />
      ) : null}

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Simple overview of your recent tasks.
            </p>
          </div>

          <Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create task
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardContent className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
                  <stat.icon className="size-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Latest task activity from your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskTable
              tasks={recentTasks}
              emptyTitle="No tasks yet"
              emptyDescription="Create a task to see activity here."
              emptyAction={
                <Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
                  Create task
                </Button>
              }
              onRetry={handleRetry}
              onEdit={handleEdit}
              onDelete={handleDelete}
              retryingTaskId={retryingTaskId}
              deletingTaskId={deletingTaskId}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
