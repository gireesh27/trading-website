// Loader.tsx
"use client";
import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen ">
      <svg className="w-16 h-12" viewBox="0 0 64 48" fill="none">
        {/* Back line */}
        <polyline
          id="back"
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          className="stroke-back"
        />
        {/* Front line */}
        <polyline
          id="front"
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          className="stroke-front animate-dash"
        />
        {/* Front line 2 with delay */}
        <polyline
          id="front2"
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          className="stroke-front animate-dash delay-1000"
        />
      </svg>
    </div>
  );
};

export default Loader;
