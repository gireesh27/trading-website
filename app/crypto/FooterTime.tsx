"use client";

import { useEffect, useState } from "react";

export default function FooterTime() {
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    // Set the current local time after client-side render
    setLocalTime(new Date().toLocaleString());

    // Optional: update the time every second
    const interval = setInterval(() => {
      setLocalTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 text-center">
      <p className="text-gray-500 text-sm">
        {localTime || "Loading..."}
      </p>
    </div>
  );
}
