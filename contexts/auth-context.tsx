// auth-context.tsx
"use client"

import { createContext, useContext } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  loginWithTwitter: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const login = async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.ok && res.url) {
      toast({ title: "Success", description: "Logged in successfully." })
      router.push("/dashboard")
    } else {
      toast({
        title: "Login failed",
        description: res?.error || "Invalid credentials",
        variant: "destructive",
      })
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    const data = await res.json()
    if (data.success) {
      toast({ title: "Account created", description: "Logging in..." })
      await login(email, password)
    } else {
      toast({
        title: "Signup failed",
        description: data.message || "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const loginWithGoogle = async () => {
    const res = await signIn("google", {
      callbackUrl: "/dashboard",
      redirect: false,
    })
    if (res?.ok && res.url) {
      router.push(res.url)
    } else {
      toast({ title: "Google sign-in failed", variant: "destructive" })
    }
  }

  const loginWithGithub = async () => {
    const res = await signIn("github", {
      callbackUrl: "/dashboard",
      redirect: false,
    })
    if (res?.ok && res.url) {
      router.push(res.url)
    } else {
      toast({ title: "GitHub sign-in failed", variant: "destructive" })
    }
  }

  const loginWithTwitter = async () => {
    const res = await signIn("twitter", {
      callbackUrl: "/dashboard",
      redirect: false,
    })
    if (res?.ok && res.url) {
      router.push(res.url)
    } else {
      toast({ title: "Twitter sign-in failed", variant: "destructive" })
    }
  }

  const logout = () => {
    signOut({ callbackUrl: "/auth" })
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user
          ? {
              id: (session.user as any).id ?? "",
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }
          : null,
        isLoading: status === "loading",
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGithub,
        loginWithTwitter,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}