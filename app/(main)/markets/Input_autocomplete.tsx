"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useSearchContext } from "@/contexts/Search-context";

export function SymbolSearchBar({
  onSelectSymbol,
}: {
  onSelectSymbol: (symbol: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, handleSymbolChange } = useSearchContext();
  const currentSuggestions = suggestions["global"] || [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Search stocks..."
        value={searchTerm}
        onChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
          setShowSuggestions(true);
          handleSymbolChange("global", value); // fetch suggestions
        }}
        className="pl-10 bg-gray-800 border-gray-700 text-white"
      />

      {/* Autocomplete Dropdown */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 bg-gray-900 border border-gray-700 rounded-md mt-1 z-10 shadow-lg">
          {currentSuggestions.map((sug) => (
            <div
              key={sug.symbol}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
              onClick={() => {
                setSearchTerm(sug.symbol);
                onSelectSymbol(sug.symbol); // trigger parent callback
                setShowSuggestions(false);
              }}
            >
              <strong>{sug.symbol}</strong> — {sug.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
