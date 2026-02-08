"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { TrendingUpIcon, LayoutDashboard } from "lucide-react";
import HeroSection from "@/components/MainPage/Hero";
import { EnhancedSections } from "@/components/MainPage/EnhancedSections";
import Loader from "@/components/loader";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { logout } = useAuth();
  const router = useRouter();
  const handleLogout = () => {
    logout();
  };
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900  ">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/60 backdrop-blur-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer">
              <TrendingUpIcon className="h-7 w-7 text-sky-500" />
              <span className="text-2xl font-bold text-white transition-all duration-300 hover:neon-text-glow">
                TradeView
              </span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Dashboard */}
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:shadow-sky-500/30 transition-all"
                      
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </motion.button>
                  </Link>

                  {/* Logout */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all"
                  >
                    Log Out
                  </motion.button>
                </>
              ) : (
                // Sign In
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="h-1 bg-gradient-to-r from-sky-500 to-indigo-500"
          style={{ scaleX }}
        />
      </motion.header>

      {/* Hero Section */}
      <HeroSection />
      <EnhancedSections />
    </div>
  );
}
