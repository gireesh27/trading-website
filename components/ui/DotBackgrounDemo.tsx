import { cn } from "@/lib/utils";
import React from "react";

interface DotBackgroundProps {
  children: React.ReactNode;
  className?: string;
  height?: string; // optional height for each card, e.g., "h-[50rem]"
}

export function DotBackground({ children, className, height = "h-[50rem]" }: DotBackgroundProps) {
  return (
    <div className={cn("relative w-full flex items-center justify-center bg-white dark:bg-black", className, height)}>
      {/* Dot background layer */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
        )}
      />

      {/* Radial gradient mask for fade effect */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Children rendered above background */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
