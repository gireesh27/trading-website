"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

// --- Zod Schema Definition ---
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const formSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Correct path for the error
  });

// --- Component ---
export default function CreateWalletPasswordForm() {
  const { toast } = useToast();

  // --- State Management ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  // --- Password Strength Calculation ---
  const passwordStrength = useMemo(() => {
    // We check each criterion individually
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
    ];
    // The strength is the number of criteria that are met
    const strength = checks.filter(Boolean).length;
    return strength;
  }, [password]);

  // --- Form Validation ---
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

  // --- Event Handlers ---
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
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Success!", description: "Wallet password has been set securely." });
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error) {
      console.error("Submit Error:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // --- Strength Bar Colors ---
  // This array defines the color for each step of the strength meter.
  const strengthBarColors = [
    "bg-red-500",       // Strength 1
    "bg-yellow-500",    // Strength 2
    "bg-emerald-400",   // Strength 3
    "bg-emerald-500",   // Strength 4
  ];

  return (
    <Card className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-cyan-400/20 shadow-2xl shadow-black/40 rounded-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-0" />
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
            <ShieldCheck className="text-cyan-300" />
            Create Wallet Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password"
               className="text-sm font-medium text-slate-300">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "pl-10 h-12 bg-slate-800/60 text-white border-2 border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all",
                    errors.password && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center gap-1.5 pt-1">
                  <AlertTriangle size={14} /> {errors.password}
                </p>
              )}
            </div>
            
            {/* Password Strength Meter */}
            <div className="flex items-center gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        // If the current segment index is less than the password strength,
                        // we color it using the color from our array. Otherwise, it's gray.
                        index < passwordStrength ? strengthBarColors[index] : 'bg-slate-700'
                      )}
                    />
                ))}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword"
               className="text-sm font-medium text-slate-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "pl-10 h-12 bg-slate-800/60 text-white border-2 border-slate-700 rounded-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 transition-all",
                    errors.confirmPassword && "border-red-500/80 focus:border-red-500 focus:ring-red-500/30"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm flex items-center gap-1.5 pt-1">
                  <AlertTriangle size={14} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:scale-105 disabled:hover:scale-100 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 transform"
            >
              Set Secure Password
            </Button>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
