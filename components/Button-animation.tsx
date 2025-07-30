import { useState } from "react";
import { Star, StarOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function WatchlistButton({
  isInWatchlist,
  isLoading,
  handleToggle,
}: {
  isInWatchlist: boolean;
  isLoading: boolean;
  handleToggle: () => void;
}) {
  const [burst, setBurst] = useState(false);

  const handleClick = () => {
    setBurst(true);
    handleToggle();
    setTimeout(() => setBurst(false), 1000); // reset burst
  };

  return (
    <div className="relative inline-block">
      <Button
        size="sm"
        variant="outline"
        disabled={isLoading}
        onClick={handleClick}
        className="relative z-10 overflow-hidden text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform duration-150 active:scale-95"
      >
        {isInWatchlist ? (
          <>
            <StarOff className="h-4 w-4 mr-2 text-yellow-400" />
            Remove from Watchlist
          </>
        ) : (
          <>
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            Add to Watchlist
          </>
        )}
      </Button>

      {/* Star burst animation */}
      <AnimatePresence>
  {burst && (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      initial={{ opacity: 1, scale: 0.8 }}
      animate={{ opacity: 0, scale: 2.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400 drop-shadow-lg"
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1.2,
            rotate: 0,
          }}
          animate={{
            x: Math.cos((i / 7) * 2 * Math.PI) * 60, // increased radius
            y: Math.sin((i / 7) * 2 * Math.PI) * 60,
            opacity: 0,
            scale: 1,
            rotate: 360,
          }}
          transition={{ duration: 1 }}
        >
          <Star className="h-6 w-6 text-yellow-300 drop-shadow-md" />
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
