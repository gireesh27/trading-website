"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ColourfulText } from "@/components/ui/colourful-text";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { TextGenerateEffect } from "@/components/ui/Text-Generate-Effect";
import { MovingBorder, MovingButton } from "@/components/ui/moving-border";
import { TailwindcssButtons } from "../ui/useFul-Buttons";
import {SparklesCore} from "@/components/ui/sparkles"

export default function HeroSection() {
  return (
<section className="relative py-24 overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
  {/* Sparkles Layer */}
  <SparklesCore
    id="hero-sparkles"
    className="absolute inset-0 z-0"
    background="transparent"
    minSize={0.4}
    maxSize={1.6}
    speed={1}
    particleColor="#ffffff"
    particleDensity={120}
  />

  {/* Hero Content */}
  <div className="container mx-auto px-4 relative z-10 text-center">
    <motion.h1
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
    >
      Leap with
      <ColourfulText text=" TradeView" />
    </motion.h1>
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5, duration: 1 }}
  className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
>
  <TextGenerateEffect
    words="Empowering traders with real-time insights, intelligent charting tools, and seamless portfolio management for smarter decisions"
    duration={1.5}
    filter={true}
    className="text-3xl font-bold text-black"
  />
</motion.div>


    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
    >
      <Link href="/auth">
        <TailwindcssButtons name="Lit up borders" />
      </Link>

      <MovingButton>Watch Demo</MovingButton>
    </motion.div>
  </div>
</section>

  );
}
