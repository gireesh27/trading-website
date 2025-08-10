import { useState, useEffect } from "react";

export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safe

    const mediaQueryList = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Listener callback
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQueryList.addEventListener
      ? mediaQueryList.addEventListener("change", listener)
      : mediaQueryList.addListener(listener); // fallback for older browsers

    // Cleanup
    return () => {
      mediaQueryList.removeEventListener
        ? mediaQueryList.removeEventListener("change", listener)
        : mediaQueryList.removeListener(listener);
    };
  }, [query]);

  return matches;
}
