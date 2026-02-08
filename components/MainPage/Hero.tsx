"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
// Helper component for the animated "aurora" background
const AuroraBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-black" />
    <div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full filter blur-3xl animate-blob"
      style={{ animationDelay: "0s" }}
    />
    <div
      className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-blob"
      style={{ animationDelay: "2s" }}
    />
    <div
      className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-blob"
      style={{ animationDelay: "4s" }}
    />
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSI+PGcgY2xhc3M9Im5jLWljb24td3JhcHBlciI+PHBhdGggZD0iTTAgMTYgSDMyIE0xNiAwIFYzMiIgLz48L2c+PC9zdmc+')] opacity-20" />
    <style jsx>{`
      @keyframes blob {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
      }
      .animate-blob {
        animation: blob 8s infinite ease-in-out;
      }
    `}</style>
  </div>
);

export default function HeroSection() {
  const text =
    "Empowering traders with real-time insights and seamless portfolio management for smarter decisions";
  const words = text.split(" ");

  // Framer Motion variants for the text generate effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.5 * i },
    }),
  };

  const childVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  } as const;
    const { user, isLoading } = useAuth();
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <AuroraBackground />

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -50, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter"
        >
          Leap with {/* Recreating "ColourfulText" with Tailwind */}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
            TradeView
          </span>
        </motion.h1>

        {/* Recreating "TextGenerateSameColour" with Framer Motion */}
        <motion.p
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={childVariants}
              className="inline-block mr-[0.5em]" // Adjust spacing between words
            >
              {word}
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Recreating "TailwindcssButtons" (Lit up borders) */}
          {user ? (
            // If signed in  Go to Dashboard
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-all duration-300 shadow-lg shadow-sky-500/20"
              >
                Get Started Now
              </motion.button>
            </Link>
          ) : (
            // If not signed in  Go to Auth
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-all duration-300 shadow-lg shadow-sky-500/20"
              >
                Sign In
              </motion.button>
            </Link>
          )}

          {/* Recreating "MovingButton" */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-full font-semibold text-slate-200 bg-slate-500/20 border border-slate-600 hover:bg-slate-500/30 transition-colors duration-300"
          >
            Watch Demo
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
