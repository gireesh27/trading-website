"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  loginWithTwitter: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check for a saved user session on initial load
    try {
      const savedUser = localStorage.getItem("tradeview-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error)
      localStorage.removeItem("tradeview-user")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleAuthSuccess = (userData: User) => {
    setUser(userData)
    localStorage.setItem("tradeview-user", JSON.stringify(userData))
    toast({
      title: "Success",
      description: `Welcome back, ${userData.name}!`,
    })
    router.push("/dashboard")
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    // Mock API call
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
        handleAuthSuccess(data.user)
    } else {
        toast({ title: "Login Failed", description: data.message, variant: "destructive" })
    }
    setIsLoading(false)
  }
  
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    // Mock API call
    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json();
     if (data.success) {
        handleAuthSuccess(data.user)
    } else {
        toast({ title: "Signup Failed", description: data.message, variant: "destructive" })
    }
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tradeview-user")
    router.push("/auth")
  }
  
  // --- Social Logins (Mock Implementations) ---
  const loginWithGoogle = async () => {
    setIsLoading(true)
    // In a real app, you would use Firebase Auth or NextAuth.js
    toast({ title: "Signing in with Google..." })
    setTimeout(() => {
        const mockUser = { id: "google123", email: "user@google.com", name: "Google User", isVerified: true };
        handleAuthSuccess(mockUser);
        setIsLoading(false);
    }, 1500);
  }

  const loginWithGithub = async () => {
    toast({ title: "Coming Soon!", description: "GitHub sign-in is not yet implemented." })
  }

  const loginWithTwitter = async () => {
    toast({ title: "Coming Soon!", description: "Twitter sign-in is not yet implemented." })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, loginWithGoogle, loginWithGithub, loginWithTwitter }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
