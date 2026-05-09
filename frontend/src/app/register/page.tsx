"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/errors"
import { registerUser } from "@/services/auth.api"
import { useAuthStore } from "@/store/auth.store"

export default function RegisterPage() {
  const router = useRouter()
  const { token, hydrated } = useAuthStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/dashboard")
    }
  }, [hydrated, router, token])

  const validate = () => {
    const nextErrors: { name?: string; email?: string; password?: string } = {}

    if (name.trim().length < 2) {
      nextErrors.name = "Name should be at least 2 characters."
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address."
    }

    if (password.length < 6) {
      nextErrors.password = "Password should be at least 6 characters."
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
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      toast.success("Account created successfully. Please sign in.")
      router.replace("/login")
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create your account."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hydrated || token) {
    return null
  }

  return (
    <AuthShell
      title="Create account"
      description="Create your account to start using the platform."
      footer={
        <span>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ashish Jha"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="text-xs text-red-500">{errors.name}</p> : null}
        </div>

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
            placeholder="Create a secure password"
            className="h-11 rounded-xl"
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password ? <p className="text-xs text-red-500">{errors.password}</p> : null}
        </div>

        <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  )
}
