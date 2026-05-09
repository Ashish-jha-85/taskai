export type TaskOperation = "uppercase" | "lowercase" | "reverse" | "wordcount"

export type TaskStatus = "pending" | "running" | "success" | "failed"

export interface TaskLog {
  message: string
  timestamp?: string
}

export interface Task {
  _id: string
  title: string
  input: string
  operation: TaskOperation
  status: TaskStatus
  result: string | number | null
  logs: TaskLog[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskPayload {
  title: string
  input: string
  operation: TaskOperation
}

export type UpdateTaskPayload = CreateTaskPayload
