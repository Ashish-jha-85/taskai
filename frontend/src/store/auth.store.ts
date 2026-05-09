import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { User } from "@/types/auth"

interface AuthState {
  user: User | null
  token: string | null
  hydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      setAuth: (user, token) => {
        set({ user, token })
      },
      logout: () => {
        set({
          user: null,
          token: null,
        })
      },
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "taskai-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
