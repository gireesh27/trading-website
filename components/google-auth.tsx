"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chrome } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

declare global {
  interface Window {
    google: any
    googleSignInCallback: (response: any) => void
  }
}

export function GoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const { loginWithGoogle } = useAuth()

  const initializeGoogleSignIn = () => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id",
        callback: handleGoogleSignIn,
      })
    }
  }

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true)
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]))

      // Call your auth context method
      const success = await loginWithGoogle()

      if (success) {
        // Handle successful login
        console.log("Google sign-in successful")
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setIsLoading(true)

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.onload = () => {
        initializeGoogleSignIn()
        window.google.accounts.id.prompt()
      }
      document.head.appendChild(script)
    } else {
      initializeGoogleSignIn()
      window.google.accounts.id.prompt()
    }
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
    >
      <Chrome className="h-4 w-4 mr-2" />
      {isLoading ? "Connecting..." : "Continue with Google"}
    </Button>
  )
}
