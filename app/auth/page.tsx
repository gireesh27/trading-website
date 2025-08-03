"use client";
import { useState } from "react";
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
import { Eye, EyeOff, Github, Twitter, Chrome } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import ErrorMessage to avoid build issues
const ErrorMessage = dynamic(() => import("./ErrorMessage"), { ssr: false });

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const callbackUrl = "/dashboard";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          redirect: false,
          email: emailForm.email,
          password: emailForm.password,

          callbackUrl,
        });

        if (res?.ok) {
          router.push(res.url ?? "/dashboard");
        } else {
          const checkRes = await fetch("/api/auth/check-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailForm.email }),
          });

          let checkData;
          try {
            checkData = await checkRes.json();
          } catch (err) {
            alert("Something went wrong. Please try again.");
            return;
          }

          if (!checkData.exists) {
            const shouldSignup = window.confirm(
              "User not found. Would you like to sign up?"
            );
            if (shouldSignup) setIsLogin(false);
          } else {
            alert("Incorrect credentials. Try again.");
          }
        }
      } else {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailForm),
        });

        let data;
        try {
          data = await response.json();
        } catch (err) {
          alert("Signup error. Please try again.");
          return;
        }

        if (data.success) {
          await signIn("credentials", {
            redirect: true,
            email: emailForm.email,
            password: emailForm.password,

            callbackUrl,
          });
        } else {
          alert(data.message || "Signup failed");
        }
      }
    } catch (error) {
      alert("Unexpected error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github" | "twitter") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-[#0e0f1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Light particle background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="animate-pulse-slow absolute w-96 h-96 bg-purple-500 opacity-20 blur-3xl rounded-full top-[-10%] left-[-10%]" />
        <div className="animate-pulse-slow absolute w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full bottom-[-10%] right-[-10%]" />
      </div>

      <Card className="w-full max-w-md z-10 backdrop-blur-lg bg-white/5 border border-white/10 shadow-2xl rounded-2xl text-white transition-all duration-500 hover:shadow-neon">
        <CardHeader className="text-center space-y-2">
          <Link
            href="/"
            className="text-3xl font-extrabold text-white neon-text drop-shadow-lg transition-all duration-300 hover:scale-105"
          >
            TradeView
          </Link>
          <CardTitle className="text-xl text-blue-300 font-semibold drop-shadow">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {isLogin
              ? "Sign in to access your dashboard."
              : "Get started with trading."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ErrorMessage />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["google", Chrome],
                ["github", Github],
                ["twitter", Twitter],
              ].map(([provider, Icon], i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => handleOAuth(provider as "google" | "github" | "twitter")}
                  className="border-white/20 bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-md text-white"
                >
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>

            <div className="relative text-white">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/10 px-2 text-gray-300 backdrop-blur-md">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={emailForm.name}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, name: e.target.value })
                    }
                    className="glass-input"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailForm.email}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, email: e.target.value })
                  }
                  className="glass-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={emailForm.password}
                    onChange={(e) =>
                      setEmailForm({ ...emailForm, password: e.target.value })
                    }
                    className="glass-input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full neon-button"
                disabled={isLoading}
              >
                {isLoading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </Button>
            </form>
          </div>
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
