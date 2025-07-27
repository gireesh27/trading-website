// File: modules/crypto/hooks/useCryptoData.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import type { CryptoData } from "@/types/crypto-types";

const ITEMS_PER_PAGE = 12;

export function useCryptoData() {
  const {
    selectedStock,
    candlestickData,
    technicalIndicators,
    selectStock,
    getCandlestickData,
  } = useMarketData();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "price" | "change" | "volume" | "marketCap"
  >("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [overviewPage, setOverviewPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "table">("overview");
  const [allCryptoData, setAllCryptoData] = useState<CryptoData[]>([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCryptoData = useCallback(async () => {
    setLoadingPage(true);
    setFetchError(null);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false&price_change_percentage=24h`
      );
      if (!response.ok) throw new Error("Failed to fetch crypto data");
      const data = await response.json();

      const mapped: CryptoData[] = data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase() + "-USD",
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
        high: coin.high_24h,
        low: coin.low_24h,
        rank: coin.market_cap_rank,
      }));

      setAllCryptoData(mapped);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
  }, [fetchCryptoData]);

  return {
    selectedStock,
    candlestickData,
    technicalIndicators,
    selectStock,
    getCandlestickData,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    overviewPage,
    setOverviewPage,
    tablePage,
    setTablePage,
    activeTab,
    setActiveTab,
    allCryptoData,
    loadingPage,
    hasMoreData,
    fetchError,
  };
}
