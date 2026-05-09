import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { CreateTaskPayload, Task, UpdateTaskPayload } from "@/types/task"

export const createTask = async (data: CreateTaskPayload) => {
  const response = await api.post<ApiResponse<Task>>("/api/tasks", data)
  return response.data
}

export const getTasks = async () => {
  const response = await api.get<ApiResponse<Task[]>>("/api/tasks")
  return response.data
}

export const getSingleTask = async (id: string) => {
  const response = await api.get<ApiResponse<Task>>(`/api/tasks/${id}`)
  return response.data
}

export const updateTask = async (id: string, data: UpdateTaskPayload) => {
  const response = await api.put<ApiResponse<Task>>(`/api/tasks/${id}`, data)
  return response.data
}

export const deleteTask = async (id: string) => {
  const response = await api.delete<ApiResponse<Task>>(`/api/tasks/${id}`)
  return response.data
}
