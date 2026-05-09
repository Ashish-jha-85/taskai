export interface User {
  id: string
  name: string
  email: string
}

export interface AuthPayload {
  email: string
  password: string
}

export interface RegisterPayload extends AuthPayload {
  name: string
}

export interface AuthResponseData {
  token: string
  user: User
}
