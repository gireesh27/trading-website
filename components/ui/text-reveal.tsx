"use client";
import React, { useEffect, useRef, useState, memo } from "react";
import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const [widthPercentage, setWidthPercentage] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [left, setLeft] = useState(0);
  const [localWidth, setLocalWidth] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      const { left, width } = cardRef.current.getBoundingClientRect();
      setLeft(left);
      setLocalWidth(width);
    }
  }, []);

  const handleMove = (x: number) => {
    if (cardRef.current) {
      const relativeX = x - left;
      setWidthPercentage((relativeX / localWidth) * 100);
    }
  };

  const rotateDeg = (widthPercentage - 50) * 0.1;

  return (
    <div
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => {
        setIsMouseOver(false);
        setWidthPercentage(0);
      }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchStart={() => setIsMouseOver(true)}
      onTouchEnd={() => {
        setIsMouseOver(false);
        setWidthPercentage(0);
      }}
      onTouchMove={(e) => handleMove(e.touches[0]!.clientX)}
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
    >
      {children}

      <div className="relative flex items-center overflow-hidden">
        {/* Reveal Layer */}
        <motion.div
          style={{ height: "75%", width: "100%" }}
          animate={
            isMouseOver
              ? {
                  opacity: widthPercentage > 0 ? 1 : 0,
                  clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                }
              : { clipPath: `inset(0 ${100 - widthPercentage}% 0 0)` }
          }
          transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
          className="absolute bg-[#0d0d10] z-20 will-change-transform flex items-center justify-center"
        >
          <p
            style={{
              textShadow: "0 0 20px rgba(168,85,247,0.6), 0 0 30px rgba(59,130,246,0.4)",
            }}
            className="px-4 text-base sm:text-[1.8rem] font-extrabold tracking-wide
                       text-transparent bg-clip-text
                       bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400"
          >
            {revealText}
          </p>
        </motion.div>

        {/* Gradient Divider Bar */}
        <motion.div
          animate={{
            left: `${widthPercentage}%`,
            rotate: `${rotateDeg}deg`,
            opacity: widthPercentage > 0 ? 1 : 0,
          }}
          transition={isMouseOver ? { duration: 0 } : { duration: 0.4 }}
          className="h-40 w-[6px] rounded-full bg-gradient-to-b from-transparent via-violet-400 to-transparent absolute z-50 will-change-transform"
        />

        {/* Base Text */}
        <div className="overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]">
          <p className="text-base sm:text-[3rem] py-10 font-bold bg-clip-text text-transparent bg-neutral-700/60">
            {text}
          </p>
          <MemoizedStars />
        </div>
      </div>
    </div>
  );
};

// Title
export const TextRevealCardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h2 className={twMerge("text-white text-lg", className)}>{children}</h2>
);

// Description
export const TextRevealCardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={twMerge("text-gray-300 text-sm", className)}>{children}</p>
);

// Stars background
const Stars = () => {
  const randomMove = () => Math.random() * 4 - 2;
  const randomOpacity = () => Math.random();
  const random = () => Math.random();
  return (
    <div className="absolute inset-0">
      {[...Array(50)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: `2px`,
            height: `2px`,
            backgroundColor: "white",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export const MemoizedStars = memo(Stars);
