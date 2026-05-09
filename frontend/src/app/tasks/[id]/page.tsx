"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Loader2,
  RefreshCcw,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useState } from "react"
import { toast } from "sonner"

import { TaskDetailSkeleton } from "@/components/skeletons/task-detail-skeleton"
import { StatusBadge } from "@/components/tasks/status-badge"
import { StatusTimeline } from "@/components/tasks/status-timeline"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { useCreateTaskMutation, useTaskQuery } from "@/hooks/use-tasks"
import { getErrorMessage } from "@/lib/errors"
import { formatDateTime } from "@/lib/format"
import { getResultText, operationLabels } from "@/lib/task"
import type { Task } from "@/types/task"

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const taskQuery = useTaskQuery(id)
  const retryMutation = useCreateTaskMutation()
  const [retryingTaskId, setRetryingTaskId] = useState<string | null>(null)

  const task = taskQuery.data

  const handleRetry = async (value: Task) => {
    setRetryingTaskId(value._id)

    try {
      const retriedTask = await retryMutation.mutateAsync({
        title: `${value.title} (Retry)`,
        input: value.input,
        operation: value.operation,
      })

      toast.success("Retry task created successfully.")
      router.push(`/tasks/${retriedTask._id}`)
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create a retry task."))
    } finally {
      setRetryingTaskId(null)
    }
  }

  const handleCopyResult = async () => {
    if (!task || task.result === null || task.result === undefined) {
      return
    }

    await navigator.clipboard.writeText(String(task.result))
    toast.success("Result copied to clipboard.")
  }

  if (taskQuery.isLoading) {
    return <TaskDetailSkeleton />
  }

  if (taskQuery.isError || !task) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Task not found"
        description="We couldn't load this task. It may have been removed or is no longer available for your account."
        action={
          <Button variant="outline" className="rounded-xl" render={<Link href="/tasks" />}>
            Back to tasks
          </Button>
        }
      />
    )
  }

  const resultText = getResultText(task)
  const isActive = task.status === "pending" || task.status === "running"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit rounded-xl px-0 hover:bg-transparent"
          render={<Link href="/tasks" />}
        >
          <ArrowLeft className="size-4" />
          Back to task workspace
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <StatusBadge status={task.status} />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {task.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Submitted on {formatDateTime(task.createdAt)} for the {operationLabels[task.operation]} operation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {task.status === "failed" ? (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => handleRetry(task)}
                disabled={retryingTaskId === task._id}
              >
                <RotateCcw className="size-4" />
                {retryingTaskId === task._id ? "Retrying..." : "Retry failed task"}
              </Button>
            ) : null}

            {task.status === "success" ? (
              <Button variant="outline" className="rounded-xl" onClick={handleCopyResult}>
                <Copy className="size-4" />
                Copy result
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="border-b border-zinc-200/80 dark:border-zinc-800">
          <CardTitle>Execution Status</CardTitle>
          <CardDescription className="mt-2">
            Live status transitions from queued to processing and final delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <StatusTimeline status={task.status} />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Operation</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {operationLabels[task.operation]}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Last update</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatDateTime(task.updatedAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Log events</p>
              <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {task.logs.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="border-b border-zinc-200/80 dark:border-zinc-800">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-zinc-500" />
              Input Payload
            </CardTitle>
            <CardDescription className="mt-2">
              Original content submitted for processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 whitespace-pre-wrap text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              {task.input}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <CardHeader className="border-b border-zinc-200/80 dark:border-zinc-800">
            <CardTitle className="flex items-center gap-2">
              {task.status === "success" ? (
                <CheckCircle2 className="size-4 text-green-600" />
              ) : task.status === "failed" ? (
                <AlertCircle className="size-4 text-red-500" />
              ) : (
                <Clock3 className="size-4 text-blue-600" />
              )}
              Result Viewer
            </CardTitle>
            <CardDescription className="mt-2">
              Output, error message, or live processing feedback for this task.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={task.status}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {task.status === "success" ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 font-mono text-sm leading-6 whitespace-pre-wrap text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
                    {resultText}
                  </div>
                ) : null}

                {task.status === "failed" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                      {resultText}
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => handleRetry(task)}
                      disabled={retryingTaskId === task._id}
                    >
                      <RefreshCcw className="size-4" />
                      {retryingTaskId === task._id ? "Retrying..." : "Create retry task"}
                    </Button>
                  </div>
                ) : null}

                {isActive ? (
                  <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <Loader2 className="size-8 animate-spin text-blue-600" />
                    <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Task is being processed
                    </p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      Status updates and final output will appear here automatically as the worker advances the job.
                    </p>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader className="border-b border-zinc-200/80 dark:border-zinc-800">
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription className="mt-2">
            Audit trail of task creation and any worker-side log events that were captured.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {task.logs.length === 0 ? (
            <EmptyState
              icon={Clock3}
              title="No logs recorded yet"
              description="This task has not emitted any worker logs beyond its default status updates."
              className="min-h-44 border-none bg-zinc-50 shadow-none dark:bg-zinc-950"
            />
          ) : (
            <div className="space-y-3">
              {task.logs.map((log, index) => (
                <div
                  key={`${log.timestamp ?? index}-${index}`}
                  className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{log.message}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {log.timestamp ? formatDateTime(log.timestamp) : "Timestamp unavailable"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
