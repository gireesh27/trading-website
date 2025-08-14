"use client";
import { cn } from "@/lib/utils/cn";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors: React.FC<MeteorsProps> = ({ number = 20, className }) => {
  const [meteorData, setMeteorData] = useState<
    { position: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    // Generate meteor positions and random animation values after hydration
    const data = Array.from({ length: number }).map((_, idx) => {
      const position = idx * (800 / number) - 400; // spread across 800px
      return {
        position,
        delay: Math.random() * 5, // 0-5s
        duration: Math.random() * 5 + 5, // 5-10s
      };
    });
    setMeteorData(data);
  }, [number]);

  // Don't render meteors until client has hydrated
  if (meteorData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {meteorData.map((meteor, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-1/2 before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: "-40px",
            left: meteor.position + "px",
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
          }}
        ></span>
      ))}
    </motion.div>
  );
};
