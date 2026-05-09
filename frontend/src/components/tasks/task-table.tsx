"use client"

import { motion } from "framer-motion"
import { AlertCircle, Pencil, RotateCcw, Trash2 } from "lucide-react"
import Link from "next/link"

import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime, truncateText } from "@/lib/format"
import { isTaskActive, operationLabels } from "@/lib/task"
import type { Task } from "@/types/task"

import { StatusBadge } from "./status-badge"

export function TaskTable({
  tasks,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRetry,
  onEdit,
  onDelete,
  retryingTaskId,
  deletingTaskId,
}: {
  tasks: Task[]
  emptyTitle: string
  emptyDescription: string
  emptyAction?: React.ReactNode
  onRetry?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  retryingTaskId?: string | null
  deletingTaskId?: string | null
}) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-200 dark:border-zinc-800">
                <TableHead className="pl-4">Task</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isActiveTask = isTaskActive(task)

                return (
                  <TableRow key={task._id} className="border-zinc-200 dark:border-zinc-800">
                    <TableCell className="pl-4">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</p>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {truncateText(task.input, 56)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-300">
                      {operationLabels[task.operation]}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-300">
                      {formatDateTime(task.updatedAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-2">
                        {task.status === "failed" && onRetry ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => onRetry(task)}
                            disabled={retryingTaskId === task._id}
                          >
                            <RotateCcw className="size-3.5" />
                            {retryingTaskId === task._id ? "Retrying..." : "Retry"}
                          </Button>
                        ) : null}
                        {onEdit ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => onEdit(task)}
                            disabled={isActiveTask}
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                            onClick={() => onDelete(task)}
                            disabled={isActiveTask || deletingTaskId === task._id}
                          >
                            <Trash2 className="size-3.5" />
                            {deletingTaskId === task._id ? "Deleting..." : "Delete"}
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="sm" className="rounded-xl" render={<Link href={`/tasks/${task._id}`} />}>
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="grid gap-4 md:hidden">
        {tasks.map((task, index) => {
          const isActiveTask = isTaskActive(task)

          return (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <Card className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{task.title}</p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {operationLabels[task.operation]}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <p>{truncateText(task.input, 100)}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Updated {formatDateTime(task.updatedAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl" render={<Link href={`/tasks/${task._id}`} />}>
                      View
                    </Button>
                    {onEdit ? (
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onEdit(task)}
                        disabled={isActiveTask}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button
                        variant="outline"
                        className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        onClick={() => onDelete(task)}
                        disabled={isActiveTask || deletingTaskId === task._id}
                      >
                        <Trash2 className="size-4" />
                        {deletingTaskId === task._id ? "Deleting..." : "Delete"}
                      </Button>
                    ) : null}
                    {task.status === "failed" && onRetry ? (
                      <Button
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => onRetry(task)}
                        disabled={retryingTaskId === task._id}
                      >
                        <RotateCcw className="size-4" />
                        Retry
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
