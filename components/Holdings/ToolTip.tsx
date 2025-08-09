import React from "react";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { TooltipContentProps } from "recharts/types/component/Tooltip";

type ChartData = {
  timestamp: number;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap?: number;
  change?: number;
  changePercent?: number;
  previousClose?: number;
};

type CustomTooltipProps = TooltipContentProps<ValueType, NameType> & {
  drawingTool: string | null;
};

export const CustomTooltip = ({
  active,
  payload,
  drawingTool,
}: CustomTooltipProps) => {
  if (drawingTool) return null;

  if (
    active &&
    payload &&
    payload.length > 0 &&
    typeof payload[0].payload === "object"
  ) {
    const data = payload[0].payload as ChartData;

    return (
      <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl p-4 shadow-xl text-xs text-white duration-200 hover:scale-[1.02] hover:shadow-2xl transition-transform">
        <p className="font-semibold text-sm text-indigo-400 mb-3 tracking-wide">
          {new Date(data.timestamp).toLocaleString()}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <span className="text-gray-400">Open</span>
          <span className="text-right font-medium">${data.open?.toFixed(2)}</span>

          <span className="text-gray-400">High</span>
          <span className="text-right font-semibold text-green-400">
            ${data.high?.toFixed(2)}
          </span>

          <span className="text-gray-400">Low</span>
          <span className="text-right font-semibold text-red-400">
            ${data.low?.toFixed(2)}
          </span>

          <span className="text-gray-400">Close</span>
          <span className="text-right font-medium">${data.close?.toFixed(2)}</span>

          <span className="text-gray-400">Change</span>
          <span
            className={`text-right font-medium ${
              data.change && data.change >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {data.change?.toFixed(2)}
          </span>

          <span className="text-gray-400">Change %</span>
          <span
            className={`text-right font-medium ${
              data.changePercent && data.changePercent >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {data.changePercent?.toFixed(2)}%
          </span>

          <span className="text-gray-400">Prev Close</span>
          <span className="text-right font-medium">
            ${data.previousClose?.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
