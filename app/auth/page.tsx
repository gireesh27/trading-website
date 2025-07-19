"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Github, Twitter, Chrome } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [emailForm, setEmailForm] = useState({ email: "", password: "", name: "" })
  const [isLogin, setIsLogin] = useState(true)
  const { login, signup, loginWithGoogle, loginWithGithub, loginWithTwitter, isLoading } = useAuth()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      await login(emailForm.email, emailForm.password)
    } else {
      await signup(emailForm.email, emailForm.password, emailForm.name)
    }
  }

  return (
    <div className="min-h-screen bg-[#131722] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-bold text-white mb-2 block">
            TradeView
          </Link>
          <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create an Account"}</CardTitle>
          <CardDescription className="text-gray-400">
            {isLogin ? "Sign in to access your dashboard." : "Get started with trading."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={loginWithGoogle} className="border-gray-600 hover:bg-gray-700"><Chrome className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={loginWithGithub} className="border-gray-600 hover:bg-gray-700"><Github className="h-4 w-4" /></Button>
                <Button variant="outline" onClick={loginWithTwitter} className="border-gray-600 hover:bg-gray-700"><Twitter className="h-4 w-4" /></Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={emailForm.name} onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })} className="bg-gray-700 border-gray-600" required={!isLogin} />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="user@example.com" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} className="bg-gray-700 border-gray-600" required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} className="bg-gray-700 border-gray-600 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>
          <div className="mt-6 text-center text-sm">
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
