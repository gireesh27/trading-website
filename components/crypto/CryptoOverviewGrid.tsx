// File: modules/crypto/components/CryptoOverviewGrid.tsx

import { Card } from "@/components/ui/card";
import { formatLargeNumber } from "./formatLargeNumber";
import type { CryptoData } from "@/types/crypto-types";

interface Props {
  allCryptoData: CryptoData[];
  overviewPage: number;
  setOverviewPage: (page: number) => void;
  selectStock: (crypto: CryptoData) => void;
}

const ITEMS_PER_PAGE = 12;

export function CryptoOverviewGrid({
  allCryptoData,
  overviewPage,
  setOverviewPage,
  selectStock,
}: Props) {
  const start = (overviewPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageData = allCryptoData.slice(start, end);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pageData.map((crypto) => (
        <Card
          key={crypto.symbol}
          className="bg-gray-700 hover:bg-gray-600 cursor-pointer p-4"
          onClick={() => selectStock(crypto)}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-white font-semibold">{crypto.name}</h2>
            <span
              className={`text-sm font-medium ${
                crypto.changePercent >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {crypto.changePercent >= 0 ? "+" : ""}
              {crypto.changePercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-lg text-white font-bold">
            ${crypto.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Volume: {formatLargeNumber(crypto.volume)}
          </p>
        </Card>
      ))}
    </div>
  );
}