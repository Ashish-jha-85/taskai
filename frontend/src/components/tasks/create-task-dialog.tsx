"use client"

import { Loader2, Pencil, Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/hooks/use-tasks"
import { getErrorMessage } from "@/lib/errors"
import { operationOptions } from "@/lib/task"
import type { CreateTaskPayload, Task, TaskOperation } from "@/types/task"

const initialFormState: CreateTaskPayload = {
  title: "",
  input: "",
  operation: "uppercase",
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  defaultOperation = "uppercase",
  mode = "create",
  initialValues,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultOperation?: TaskOperation
  mode?: "create" | "edit"
  initialValues?: CreateTaskPayload & { id?: string }
  onSaved?: (task: Task) => void
}) {
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const [form, setForm] = useState<CreateTaskPayload>(() => ({
    title: initialValues?.title ?? initialFormState.title,
    input: initialValues?.input ?? initialFormState.input,
    operation: initialValues?.operation ?? defaultOperation,
  }))
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskPayload, string>>>({})

  const isEditMode = mode === "edit"
  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending

  const validate = () => {
    const nextErrors: Partial<Record<keyof CreateTaskPayload, string>> = {}

    if (form.title.trim().length < 3) {
      nextErrors.title = "Title should be at least 3 characters."
    }

    if (form.input.trim().length === 0) {
      nextErrors.input = "Input text is required."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      toast.error("Please review the form and try again.")
      return
    }

    try {
      const payload = {
        title: form.title.trim(),
        input: form.input.trim(),
        operation: form.operation,
      }

      const task = isEditMode
        ? await updateTaskMutation.mutateAsync({
            id: initialValues?.id ?? "",
            payload,
          })
        : await createTaskMutation.mutateAsync(payload)

      toast.success(isEditMode ? "Task updated successfully." : "Task created successfully.")
      onSaved?.(task)
      onOpenChange(false)
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isEditMode ? "Failed to update task." : "Failed to create task."
        )
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the task and queue it again for processing."
              : "Submit a text processing job and track its status in real time."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">Task title</Label>
            <Input
              id="task-title"
              placeholder="Summarize support note into uppercase"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              aria-invalid={Boolean(errors.title)}
              className="h-11 rounded-xl"
            />
            {errors.title ? <p className="text-xs text-red-500">{errors.title}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-operation">Operation</Label>
            <select
              id="task-operation"
              value={form.operation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  operation: event.target.value as TaskOperation,
                }))
              }
              className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-900 dark:focus:ring-blue-950"
            >
              {operationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {operationOptions.find((option) => option.value === form.operation)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-input">Input</Label>
            <Textarea
              id="task-input"
              rows={6}
              placeholder="Paste the content you want to process..."
              value={form.input}
              onChange={(event) =>
                setForm((current) => ({ ...current, input: event.target.value }))
              }
              aria-invalid={Boolean(errors.input)}
              className="rounded-xl"
            />
            {errors.input ? <p className="text-xs text-red-500">{errors.input}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl px-4"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isEditMode ? "Saving..." : "Submitting..."}
                </>
              ) : isEditMode ? (
                <>
                  <Pencil className="size-4" />
                  Save changes
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create task
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
