import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type { AuthPayload, AuthResponseData, RegisterPayload } from "@/types/auth"

export const registerUser = async (data: RegisterPayload) => {
  const response = await api.post<ApiResponse<AuthResponseData>>("/api/auth/register", data)
  return response.data
}

export const loginUser = async (data: AuthPayload) => {
  const response = await api.post<ApiResponse<AuthResponseData>>("/api/auth/login", data)
  return response.data
}
