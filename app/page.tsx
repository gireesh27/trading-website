"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav"; // ✅ Import MainNav
import Link from "next/link";
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Smartphone,
  Globe,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import HeroSection from "@/components/MainPage/Hero";
import { EnhancedSections } from "@/components/MainPage/EnhancedSections";
// ... other imports remain unchanged

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // ✅ Redirect when authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // ✅ Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">Loading TradeView...</p>
        </div>
      </div>
    );
  }

  // ✅ Fallback marketing landing for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header (only for guests) */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg shadow-md z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500 animate-glow" />
              <span className="text-3xl font-extrabold text-white neon-text transition-all duration-300 hover:scale-105">
                TradeView
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="text-white hover:text-blue-400 transition-colors duration-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="neon-button px-5 py-2">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />
      <EnhancedSections />


    </div>
  );
}
