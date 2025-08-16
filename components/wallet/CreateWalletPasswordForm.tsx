"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
export default function CreateWalletPasswordForm() {
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {}
  );

  const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/^[a-zA-Z0-9]+$/, "Password must be alphanumeric.");

  const formSchema = z
    .object({
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });

  const validate = () => {
    const result = formSchema.safeParse({ password, confirmPassword });

    if (!result.success) {
      const newErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        newErrors[field] = err.message;
      });

      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch("/api/wallet/set-wallet-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }

      toast({ title: "Wallet password set successfully!" });
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error) {
      console.error("Submit Error:", error);
      toast({
        title: "Network Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
     <Card className="max-w-md w-full bg-gradient-to-b from-zinc-900/80 to-zinc-800/60 border border-zinc-700 rounded-2xl shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
          Create Wallet Password
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div className="relative">
            <label className="text-white text-sm mb-1 block">New Password</label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-indigo-400 hover:text-indigo-300 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label className="text-white text-sm mb-1 block">Confirm Password</label>
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-9 text-indigo-400 hover:text-indigo-300 transition"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirm && (
              <p className="text-sm text-red-500 mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 transition text-white font-semibold py-2 rounded-xl"
            disabled={password.length < 8 || password !== confirmPassword}
          >
            Set Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
