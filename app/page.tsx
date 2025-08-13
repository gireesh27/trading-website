"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoaderFive } from "@/components/ui/loader";
import {ColourfulText} from "@/components/ui/colourful-text"
import {ContainerTextFlip} from "@/components/ui/container-text-flip"
import { TailwindcssButtons } from "@/components/ui/useFul-Buttons";
import {
  TrendingUp,
} from "lucide-react";
import HeroSection from "@/components/MainPage/Hero";
import { EnhancedSections } from "@/components/MainPage/EnhancedSections";
export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <LoaderFive text="Loading..." />;
      </div>
    );
  }

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
               <TailwindcssButtons name="Top Gradient" />
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
