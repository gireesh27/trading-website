// File: modules/crypto/components/SelectedCryptoDetails.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLargeNumber } from "./formatLargeNumber";
import type { CryptoData } from "@/types/crypto-types";

interface Props {
  selectedStock: CryptoData;
  candlestickData: any[];
  technicalIndicators: any;
}

export function SelectedCryptoDetails({ selectedStock, candlestickData, technicalIndicators }: Props) {
  return (
    <Card className="bg-gray-800 border-gray-700 mt-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>
            {selectedStock.name} ({selectedStock.symbol})
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">
              ${selectedStock.price.toLocaleString()}
            </span>
            <span
              className={`text-lg font-medium ${
                selectedStock.changePercent >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {selectedStock.changePercent >= 0 ? "+" : ""}
              {selectedStock.changePercent.toFixed(2)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">24h Change</p>
            <p className={`text-lg font-semibold ${selectedStock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {selectedStock.change >= 0 ? "+" : "-"}${Math.abs(selectedStock.change).toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Volume</p>
            <p className="text-white">{formatLargeNumber(selectedStock.volume)}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">24h High</p>
            <p className="text-green-400 text-lg font-semibold">
              ${selectedStock.high?.toFixed(2) ?? "N/A"}
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">24h Low</p>
            <p className="text-red-400 text-lg font-semibold">
              ${selectedStock.low?.toFixed(2) ?? "N/A"}
            </p>
          </div>
        </div>

        {candlestickData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white text-lg font-semibold mb-4">Price Chart</h3>
            <div className="bg-gray-700 rounded-lg p-4 h-64 flex items-center justify-center">
              <p className="text-gray-400">
                Chart visualization would go here
                <br />
                <span className="text-sm">
                  Data points: {candlestickData.length} | Latest: $
                  {candlestickData.at(-1)?.close?.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        )}

        {technicalIndicators && (
          <div className="mt-6">
            <h3 className="text-white text-lg font-semibold mb-4">Technical Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">RSI</p>
                <p className="text-white font-semibold">
                  {technicalIndicators.rsi?.at(-1)?.toFixed(2) ?? "N/A"}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">SMA (20)</p>
                <p className="text-white font-semibold">
                  ${technicalIndicators.sma20?.at(-1)?.toFixed(2) ?? "N/A"}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">EMA (12)</p>
                <p className="text-white font-semibold">
                  ${technicalIndicators.ema12?.at(-1)?.toFixed(2) ?? "N/A"}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-gray-400 text-sm">MACD</p>
                <p className="text-white font-semibold">
                  {technicalIndicators.macd?.line?.at(-1)?.toFixed(4) ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
