"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils/cn";

export const TextGenerateSameColour = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

const colors = [
  "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500",      // light grey gradient
  "bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600", // violet shade
  "bg-gradient-to-r from-white/70 via-gray-300 to-gray-500",      // whitish gradient
  "bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600",      // soft grey
];


  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration ? duration : 1,
        delay: stagger(0.2),
      }
    );
  }, [scope.current]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="flex flex-wrap gap-x-1">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            initial={{ opacity: 0, filter: filter ? "blur(10px)" : "none" }}
            animate={{ opacity: 1, filter: "none" }}
            transition={{ duration, delay: idx * 0.1 }}
            className={`font-bold text-transparent bg-clip-text ${
              colors[idx % colors.length]
            } transition-transform duration-500 hover:scale-110`}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">{renderWords()}</div>
    </div>
  );
};
