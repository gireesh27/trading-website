"use client";

import React, { useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";
import type { Props as SectorProps } from "recharts/types/shape/Sector";

// Define the structure for a single holding
interface Holding {
  sector?: string;
  currentPrice: number;
  quantity: number;
}

// Define the structure for the aggregated sector data used by the chart
interface SectorData {
  name: string;
  value: number;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#10b981"];

// --- Typed Props for Custom Components ---

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: SectorData;
  }[];
}

interface CustomLegendProps {
  payload?: {
    value: string; // This is the name of the sector
    color: string;
  }[];
}

type ActiveShapeProps = SectorProps & {
  payload: { name: string; value: number };
  percent: number;
  value: number;
  midAngle: number;
  startAngle: number;
  endAngle: number;
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
};

// --- Custom Components ---

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg border border-gray-700 shadow-lg"
      >
        <p className="text-sm text-gray-300 capitalize">{`${data.name}`}</p>
        <p className="text-lg font-bold text-white">{`₹${Number(
          data.value
        ).toLocaleString("en-IN")}`}</p>
      </motion.div>
    );
  }
  return null;
};

const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  return (
    <ul className="flex justify-center items-center gap-4 mt-4 flex-wrap">
      {payload?.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-400 text-sm capitalize">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
};

const renderActiveShape = (props: ActiveShapeProps) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill = "#8884d8",
    payload,
    percent,
    midAngle,
  } = props;

  const cxN = typeof cx === "number" ? cx : Number(cx) || 0;
  const cyN = typeof cy === "number" ? cy : Number(cy) || 0;
  const irN =
    typeof innerRadius === "number" ? innerRadius : Number(innerRadius) || 0;
  const orN =
    typeof outerRadius === "number" ? outerRadius : Number(outerRadius) || 0;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cxN + (orN + 5) * cos;
  const sy = cyN + (orN + 5) * sin;
  const mx = cxN + (orN + 15) * cos;
  const my = cyN + (orN + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 11;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <Sector
        cx={cxN}
        cy={cyN}
        innerRadius={irN}
        outerRadius={orN + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#111827"
        strokeWidth={3}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        textAnchor={textAnchor}
        fill="#e5e7eb"
        className="text-xs capitalize"
      >
        {payload?.name ?? ""}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        dy={14}
        textAnchor={textAnchor}
        fill="#9ca3af"
        className="text-xs"
      >
        {(percent * 100).toFixed(2)}%
      </text>
    </g>
  );
};

// --- Main Component ---
interface AppProps {
  holdings: Holding[];
}

export default function App({ holdings }: AppProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectorAllocation = holdings.reduce(
    (acc: { [key: string]: number }, h) => {
      const sector = h.sector?.toLowerCase() || "others";
      const value = h.currentPrice * h.quantity;
      acc[sector] = (acc[sector] || 0) + value;
      return acc;
    },
    {}
  );

  const sectorData: SectorData[] = Object.entries(sectorAllocation).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const totalValue = sectorData.reduce((sum, entry) => sum + entry.value, 0);

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    []
  );

  return (

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gray-900/50 relative backdrop-blur-xl border border-gray-800 p-4 lg:p-6 rounded-2xl w-full max-w-lg mx-auto shadow-2xl shadow-blue-500/10"
      >
        <div className="flex items-center justify-between mb-6 text-center font-bold text-xl drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PieChartIcon className="text-blue-400" size={24} />
            Sector Allocation
          </h2>
        </div>

        {sectorData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <p className="text-gray-500">No holdings data available.</p>
          </div>
        ) : (
          <div className="relative w-full h-[350px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ₹{totalValue.toLocaleString("en-IN")}
              </p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={(p : any) =>
                    renderActiveShape(p as ActiveShapeProps)
                  }
                  data={sectorData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={80}
                  fill="#8884d8"
                  stroke="#111827"
                  strokeWidth={3}
                  onMouseEnter={onPieEnter}
                >
                  {sectorData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.1)" }}
                />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
  );
}
