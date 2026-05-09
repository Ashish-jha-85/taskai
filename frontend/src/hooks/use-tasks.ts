"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createTask,
  deleteTask,
  getSingleTask,
  getTasks,
  updateTask,
} from "@/services/task.api"
import { isTaskActive } from "@/lib/task"
import type { CreateTaskPayload, UpdateTaskPayload } from "@/types/task"

export function useTasksQuery() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await getTasks()
      return response.data
    },
    refetchInterval: (query) => {
      const tasks = query.state.data ?? []
      return tasks.some(isTaskActive) ? 3_000 : 12_000
    },
  })
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const response = await getSingleTask(id)
      return response.data
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const task = query.state.data
      return task && isTaskActive(task) ? 2_000 : false
    },
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await createTask(payload)
      return response.data
    },
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.setQueryData(["tasks", task._id], task)
    },
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateTaskPayload
    }) => {
      const response = await updateTask(id, payload)
      return response.data
    },
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.setQueryData(["tasks", task._id], task)
    },
  })
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteTask(id)
      return response.data
    },
    onSuccess: async (task) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.removeQueries({ queryKey: ["tasks", task._id] })
    },
  })
}
