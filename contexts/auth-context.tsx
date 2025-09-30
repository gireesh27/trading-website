"use client"

import { createContext, useContext } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify";

interface AuthContextType {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    walletPasswordHash?: string | null
  } | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.ok && res.url) {
      toast.success("Logged in successfully")
      router.push("/")
    } else {
      toast.error("Login failed");
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
      toast.success("Account Created successfully");
      await login(email, password)
    } else {
     toast.error(data.message || "Signup failed")
    }
  }

  const loginWithGoogle = async () => {
    const res = await signIn("google", {
      callbackUrl: "/",
      redirect: false,
    })
    if (res?.ok && res.url) {
      router.push(res.url)
    } else {
     toast.error("Google sign-in failed");
    }
  }

  const loginWithGithub = async () => {
    const res = await signIn("github", {
      callbackUrl: "/",
      redirect: false,
    })
    if (res?.ok && res.url) {
      router.push(res.url)
    } else {
     toast.error("Github sign-in failed")
    }
  }


  const logout = () => {
    signOut({ callbackUrl: "/" })
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
              walletPasswordHash: session.user.walletPasswordHash,
            }
          : null,
        isLoading: status === "loading",
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithGithub,
      
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