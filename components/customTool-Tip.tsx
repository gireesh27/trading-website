import React from "react";
import {  ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { TooltipContentProps } from "recharts/types/component/Tooltip";

type ChartData = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type CustomTooltipProps = TooltipContentProps<ValueType, NameType> & {
  drawingTool: string | null;
};

export const CustomTooltip = ({
  active,
  payload,
  drawingTool,
}: CustomTooltipProps) => {
  if (drawingTool) return null; // ✅ Hide during drawing

  if (
    active &&
    payload &&
    payload.length > 0 &&
    typeof payload[0].payload === "object"
  ) {
    const data = payload[0].payload as ChartData;

    return (
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-lg text-xs text-white">
        <p className="font-bold mb-2">
          {new Date(data.timestamp).toLocaleString()}
        </p>
        <div className="grid grid-cols-2 gap-x-4">
          <span>Open:</span>
          <span className="text-right">${data.open?.toFixed(2)}</span>
          <span>High:</span>
          <span className="text-right text-green-400">
            ${data.high?.toFixed(2)}
          </span>
          <span>Low:</span>
          <span className="text-right text-red-400">
            ${data.low?.toFixed(2)}
          </span>
          <span>Close:</span>
          <span className="text-right">${data.close?.toFixed(2)}</span>
          <span>Volume:</span>
          <span className="text-right text-blue-400">
            {data.volume?.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }

  return null;
};


export default CustomTooltip;
