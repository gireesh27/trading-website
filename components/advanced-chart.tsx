"use client";

import React, { useEffect, useRef, memo } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
} from 'lightweight-charts';
interface AdvancedChartProps {
  symbol: string;
  data: CandlestickData[];
  currentPrice: number;
  change: number;
  changePercent: number;
  onTimeframeChange: (timeframe: string) => void;
}

const AdvancedChartComponent: React.FC<AdvancedChartProps> = ({
  data,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !chartContainerRef.current) return;

    // Create chart
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 600,
      height: 400,
      layout: {
        background: { color: '#131722' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: '#334158' },
        horzLines: { color: '#334158' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
      },
    });

    // Add candlestick series with correct type
    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    }) as ISeriesApi<'Candlestick'>;

    // Resize chart on window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, 400);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current?.remove();
    };
  }, []);

  // Update data
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  return (
    <div ref={chartContainerRef} className="relative w-full h-[400px]">
      {(!data || data.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">No chart data available for this timeframe.</p>
        </div>
      )}
    </div>
  );
};

export const AdvancedChart = memo(AdvancedChartComponent);
