"use client"

import { Search, SlidersHorizontal, Sparkles, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { TaskTable } from "@/components/tasks/task-table"
import { TaskListSkeleton } from "@/components/skeletons/task-list-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
} from "@/hooks/use-tasks"
import { getErrorMessage } from "@/lib/errors"
import { isTaskActive, operationOptions } from "@/lib/task"
import type { Task, TaskOperation, TaskStatus } from "@/types/task"

type FilterStatus = TaskStatus | "all"
type FilterOperation = TaskOperation | "all"

export default function TasksPage() {
  const tasksQuery = useTasksQuery()
  const retryMutation = useCreateTaskMutation()
  const deleteMutation = useDeleteTaskMutation()
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [operationFilter, setOperationFilter] = useState<FilterOperation>("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)

  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data])
  const activeTasks = useMemo(() => tasks.filter(isTaskActive), [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchValue.trim().length === 0 ||
        task.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        task.input.toLowerCase().includes(searchValue.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesOperation =
        operationFilter === "all" || task.operation === operationFilter

      return matchesSearch && matchesStatus && matchesOperation
    })
  }, [operationFilter, searchValue, statusFilter, tasks])

  const handleRetry = async (task: Task) => {
    setRetryingTaskId(task._id)

    try {
      await retryMutation.mutateAsync({
        title: `${task.title} (Retry)`,
        input: task.input,
        operation: task.operation,
      })

      toast.success("Retry task queued successfully.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to queue a retry for this task."))
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
    return <TaskListSkeleton />
  }

  if (tasksQuery.isError) {
    return (
      <EmptyState
        icon={XCircle}
        title="Task workspace unavailable"
        description="We couldn't load the task list right now. Check the backend connection and try once more."
        action={
          <Button onClick={() => tasksQuery.refetch()} className="rounded-xl">
            Try again
          </Button>
        }
      />
    )
  }

  const hasFilters = Boolean(searchValue) || statusFilter !== "all" || operationFilter !== "all"

  return (
    <>
      <CreateTaskDialog
        key={createOpen ? "open" : "closed"}
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
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="rounded-full border-zinc-200 bg-white px-3 py-1 text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Sparkles className="size-3.5" />
              {activeTasks.length > 0 ? `${activeTasks.length} tasks updating live` : "No active queue items"}
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Task Workspace
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Search across your jobs, filter by status or operation, and jump into logs and results whenever you need them.
              </p>
            </div>
          </div>

          <Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
            Create task
          </Button>
        </section>

        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-zinc-500" />
              Search and Filters
            </CardTitle>
            <CardDescription className="mt-2">
              Refine the task pipeline without losing the full responsive view on smaller screens.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_0.8fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search by title or input text"
                className="h-11 rounded-xl pl-9"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-900 dark:focus:ring-blue-950"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={operationFilter}
              onChange={(event) => setOperationFilter(event.target.value as FilterOperation)}
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-900 dark:focus:ring-blue-950"
            >
              <option value="all">All operations</option>
              {operationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => {
                setSearchValue("")
                setStatusFilter("all")
                setOperationFilter("all")
              }}
            >
              Reset
            </Button>
          </CardContent>
        </Card>

        <TaskTable
          tasks={filteredTasks}
          emptyTitle={hasFilters ? "No tasks match these filters" : "No tasks created yet"}
          emptyDescription={
            hasFilters
              ? "Try adjusting the search term or filters to surface more results."
              : "Create your first processing job to populate the workspace."
          }
          emptyAction={
            hasFilters ? (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSearchValue("")
                  setStatusFilter("all")
                  setOperationFilter("all")
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button className="rounded-xl" onClick={() => setCreateOpen(true)}>
                Create task
              </Button>
            )
          }
          onRetry={handleRetry}
          onEdit={handleEdit}
          onDelete={handleDelete}
          retryingTaskId={retryingTaskId}
          deletingTaskId={deletingTaskId}
        />
      </div>
    </>
  )
}
