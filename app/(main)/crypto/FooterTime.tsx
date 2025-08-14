"use client";

import { useEffect, useState } from "react";

export default function FooterTime() {
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    setLocalTime(new Date().toLocaleString());

    const interval = setInterval(() => {
      setLocalTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 flex justify-center relative z-10">
      <div className="px-4 py-2 rounded-lg bg-gray-900/70 backdrop-blur-sm border border-gray-700 shadow-lg">
        <p className="text-gray-300 text-sm font-medium">
          {localTime || "Loading..."}
        </p>
      </div>
    </div>
  );
}
