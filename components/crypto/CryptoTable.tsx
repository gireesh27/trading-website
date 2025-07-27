// File: modules/crypto/components/CryptoTable.tsx

import { formatLargeNumber } from "./formatLargeNumber";
import type { CryptoData } from "@/types/crypto-types";

interface Props {
  allCryptoData: CryptoData[];
  sortBy: "name" | "price" | "change" | "volume" | "marketCap";
  setSortBy: (value: Props["sortBy"]) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: Props["sortOrder"]) => void;
  tablePage: number;
  setTablePage: (value: number) => void;
  selectStock: (crypto: CryptoData) => void;
}

export function CryptoTable({
  allCryptoData,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  tablePage,
  setTablePage,
  selectStock,
}: Props) {
  const sorted = [...allCryptoData].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return 0;
  });

  const start = (tablePage - 1) * 12;
  const pageData = sorted.slice(start, start + 12);

  const handleSort = (key: Props["sortBy"]) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm text-left text-white">
        <thead className="bg-gray-800 text-gray-400">
          <tr>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("name")}>Name</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("price")}>Price</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("change")}>Change</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("volume")}>Volume</th>
            <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort("marketCap")}>Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((crypto) => (
            <tr
              key={crypto.symbol}
              className="border-t border-gray-700 hover:bg-gray-700 cursor-pointer"
              onClick={() => selectStock(crypto)}
            >
              <td className="px-4 py-3">{crypto.name}</td>
              <td className="px-4 py-3">${crypto.price.toLocaleString()}</td>
              <td
                className={`px-4 py-3 ${
                  crypto.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {crypto.change >= 0 ? "+" : "-"}${Math.abs(crypto.change).toFixed(2)}
              </td>
              <td className="px-4 py-3">{formatLargeNumber(crypto.volume)}</td>
              <td className="px-4 py-3">{formatLargeNumber(crypto.marketCap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}