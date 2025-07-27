"use client";

import { useCryptoData } from "@/hooks/useCryptoData";
import { MarketOverview } from "@/components/crypto/MarketOverviewGrid";
import { CryptoOverviewGrid } from "@/components/crypto/CryptoOverviewGrid";
import { CryptoTable } from "@/components/crypto/CryptoTable";
import { SelectedCryptoDetails } from "@/components/crypto/SelectedCryptoDetails";

export function CryptoPageLayout() {
  const crypto = useCryptoData();

  return (
    <div className="min-h-screen bg-[#131722] p-4 md:p-6">
      <MarketOverview
        activeTab={crypto.activeTab}
        setActiveTab={crypto.setActiveTab}
      />

      {crypto.activeTab === "overview" ? (
        <CryptoOverviewGrid
          allCryptoData={crypto.allCryptoData}
          overviewPage={crypto.overviewPage}
          setOverviewPage={crypto.setOverviewPage}
          selectStock={crypto.selectStock as any}
        />
      ) : (
        <CryptoTable
          allCryptoData={crypto.allCryptoData}
          sortBy={crypto.sortBy}
          sortOrder={crypto.sortOrder}
          setSortOrder={crypto.setSortOrder}
          tablePage={crypto.tablePage}
          setTablePage={crypto.setTablePage}
          setSortBy={crypto.setSortBy as any}
          selectStock={crypto.selectStock as any}
        />
      )}

      {crypto.selectedStock && (
        <SelectedCryptoDetails
          selectedStock={crypto.selectedStock as any}
          candlestickData={crypto.candlestickData}
          technicalIndicators={crypto.technicalIndicators}
        />
      )}
    </div>
  );
}