import type { Task, TaskOperation, TaskStatus } from "@/types/task"

export const operationLabels: Record<TaskOperation, string> = {
  uppercase: "Uppercase",
  lowercase: "Lowercase",
  reverse: "Reverse",
  wordcount: "Word Count",
}

export const operationDescriptions: Record<TaskOperation, string> = {
  uppercase: "Convert incoming text to uppercase instantly.",
  lowercase: "Normalize user input into lowercase output.",
  reverse: "Flip the text payload character by character.",
  wordcount: "Return the total number of words in the payload.",
}

export const operationOptions = Object.entries(operationLabels).map(([value, label]) => ({
  value: value as TaskOperation,
  label,
  description: operationDescriptions[value as TaskOperation],
}))

export const statusMeta: Record<
  TaskStatus,
  {
    label: string
    className: string
    dotClassName: string
  }
> = {
  pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
    dotClassName: "bg-amber-500",
  },
  running: {
    label: "Running",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
    dotClassName: "bg-blue-600",
  },
  success: {
    label: "Success",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300",
    dotClassName: "bg-green-600",
  },
  failed: {
    label: "Failed",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
    dotClassName: "bg-red-500",
  },
}

export function isTaskActive(task: Pick<Task, "status">) {
  return task.status === "pending" || task.status === "running"
}

export function getResultText(task: Pick<Task, "result" | "status">) {
  if (task.status === "failed") {
    return "Execution failed"
  }

  if (task.result === null || task.result === undefined) {
    return "Awaiting output"
  }

  return String(task.result)
}

export function getSuccessRate(tasks: Task[]) {
  if (tasks.length === 0) {
    return 0
  }

  const successCount = tasks.filter((task) => task.status === "success").length
  return (successCount / tasks.length) * 100
}

export function getTasksCreatedToday(tasks: Task[]) {
  const today = new Date()
  return tasks.filter((task) => {
    const createdAt = new Date(task.createdAt)
    return (
      createdAt.getFullYear() === today.getFullYear() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getDate() === today.getDate()
    )
  }).length
}

export function getAverageInputSize(tasks: Task[]) {
  if (tasks.length === 0) {
    return 0
  }

  const totalWords = tasks.reduce((sum, task) => {
    const wordCount = task.input.trim().split(/\s+/).filter(Boolean).length
    return sum + wordCount
  }, 0)

  return totalWords / tasks.length
}
