"use client";
import { createContext, useContext, useState } from "react";
import {stockApi} from "@/lib/api/stock-api";

interface Suggestion {
  symbol: string;
  name: string;
}

interface SearchContextType {
  suggestions: Record<string, Suggestion[]>;
  handleSymbolChange: (watchlistId: string, value: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion[]>>({});

  const handleSymbolChange = async (watchlistId: string, value: string) => {
    try {
      const res = await stockApi.searchSymbol(value);
      setSuggestions((prev) => ({ ...prev, [watchlistId]: res.slice(0, 5) }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [watchlistId]: [] }));
    }
  };

  return (
    <SearchContext.Provider value={{ suggestions, handleSymbolChange }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearchContext must be used within a SearchProvider");
  return context;
};
