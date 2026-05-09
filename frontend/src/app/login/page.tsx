"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/services/auth.api"
import { useAuthStore } from "@/store/auth.store"
import { getErrorMessage } from "@/lib/errors"

export default function LoginPage() {
  const router = useRouter()
  const { token, hydrated, setAuth } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/dashboard")
    }
  }, [hydrated, router, token])

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      toast.error("Please review the highlighted fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      })

      setAuth(response.data.user, response.data.token)
      toast.success("Welcome back.")
      router.replace("/dashboard")
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in right now."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hydrated || token) {
    return null
  }

  return (
    <AuthShell
      title="Sign in"
      description="Sign in to continue to your dashboard."
      footer={
        <span>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? <p className="text-xs text-red-500">{errors.password}</p> : null}
        </div>

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  )
}
