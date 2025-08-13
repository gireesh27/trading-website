"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa"; // <-- replaced Twitter with GitHub
import Link from "next/link";
import dynamic from "next/dynamic";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

const ErrorMessage = dynamic(() => import("./ErrorMessage"), { ssr: false });

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: "", password: "", name: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isLogin) {
        const res = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailForm),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          alert(data.message || data.error || "Signup failed.");
          setIsLoading(false);
          return;
        }

        await handleSignIn(emailForm.email, emailForm.password);
      } else {
        await handleSignIn(emailForm.email, emailForm.password);
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (res?.error) {
      alert(res.error || "Login failed");
    } else {
      router.push("/dashboard");
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div
      ref={parentRef}
      className="relative min-h-screen bg-[#0e0f1a] flex items-center justify-center p-4 overflow-hidden"
    >
      <BackgroundBeamsWithCollision className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full" />
        <div className="w-96 h-96 bg-blue-500 opacity-30 blur-3xl rounded-full" />
      </BackgroundBeamsWithCollision>

      <Card className="w-full max-w-md z-10 backdrop-blur-lg bg-gradient-to-br from-[#1a1c2b]/90 via-[#2a2c3d]/70 to-[#1a1c2b]/90 border border-white/20 shadow-2xl rounded-2xl text-white transition-all duration-500 hover:shadow-neon">
        <CardHeader className="text-center space-y-2">
          <Link
            href="/"
            className="text-3xl font-extrabold text-white drop-shadow-lg transition-all duration-300 hover:scale-105"
          >
            TradeView
          </Link>
          <CardTitle className="text-xl text-blue-300 font-semibold drop-shadow">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isLogin ? "Sign in to access your dashboard." : "Get started with trading."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ErrorMessage />

          <div className="flex justify-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center border-white/30 bg-[#2a2c3d] hover:bg-[#3a3c5d] text-white transition-all duration-300"
            >
              <FcGoogle className="h-5 w-5 mr-2" /> Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuth("github")} // <-- GitHub
              className="flex items-center justify-center border-white/30 bg-[#2a2c3d] hover:bg-[#3a3c5d] text-white transition-all duration-300"
            >
              <FaGithub className="h-5 w-5 mr-2" /> GitHub
            </Button>
          </div>

          <div className="relative text-white mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1a1c2b]/90 px-2 text-gray-300 backdrop-blur-md">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={emailForm.name}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, name: e.target.value })
                  }
                  className="bg-[#2a2c3d] text-white placeholder-gray-400 border border-white/20"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={emailForm.email}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, email: e.target.value })
                }
                className="bg-[#2a2c3d] text-white placeholder-gray-400 border border-white/20"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={emailForm.password}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, password: e.target.value })
                  }
                  className="bg-[#2a2c3d] text-white placeholder-gray-400 border border-white/20 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:underline transition-all"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
