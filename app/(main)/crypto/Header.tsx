"use client";

import { useState } from "react";
import { Search, Filter, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header({
  searchTerm,
  setSearchTerm,
  handleRefresh,
  loadingPage,
  sortOrder,
  setSortOrder,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleRefresh: () => void;
  loadingPage: boolean;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}) {
  return (
    <header className="sticky top-0 z-50 w-full text-black">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 h-16 md:h-20">
        {/* Brand */}
        <div className="flex flex-col items-start text-center mb-6 md:mb-10 relative z-10">
          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 animate-gradient-x tracking-tight leading-tight">
            Global Crypto Dashboard
          </h2>

          {/* Subtitle */}
          <p className="mt-2 sm:mt-3 text-gray-300 text-sm sm:text-normal md:text-lg lg:text-lg xl:text-xl">
            Real-Time Crypto Prices, Charts & Market Analysis
          </p>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-6">
          {/* Search */}
          <div className="relative w-40 sm:w-56 lg:w-64 xl:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="search"
              placeholder="Search crypto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Sort */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            aria-pressed={sortOrder === "asc" ? "true" : "false"}
          >
            <Filter size={16} className="mr-2" />
            Sort {sortOrder === "desc" ? "↓" : "↑"}
          </Button>

          {/* Refresh */}
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={loadingPage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:opacity-90 transition"
          >
            {loadingPage ? (
              <span className="flex items-center space-x-2">
                <span className="animate-pulse">Loading</span>
                <RefreshCw className="animate-spin" size={16} />
              </span>
            ) : (
              "Refresh"
            )}
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 sm:w-80 bg-background border-l"
            >
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    type="search"
                    placeholder="Search crypto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Sort */}
                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                  }
                >
                  <Filter size={18} className="mr-2" />
                  Sort {sortOrder === "desc" ? "↓" : "↑"}
                </Button>

                {/* Refresh */}
                <Button
                  onClick={handleRefresh}
                  disabled={loadingPage}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:opacity-90 transition"
                >
                  {loadingPage ? (
                    <span className="flex items-center space-x-2">
                      <span className="animate-pulse">Loading</span>
                      <RefreshCw className="animate-spin" size={18} />
                    </span>
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
