// lib/utils/indicator-calculations.ts
import { ChartData } from "@/components/advanced-trading-chart";

/**
 * Calculates the Simple Moving Average (SMA) for a given period.
 * @param data - The array of chart data.
 * @param period - The lookback period (e.g., 20, 50).
 * @returns The data array with the 'sma' property added.
 */
export function calculateSMA(data: ChartData[], period: number): ChartData[] {
  const smaKey = `sma${period}` as keyof ChartData;
  return data.map((d, i, all) => {
    if (i < period - 1) return d;
    const slice = all.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + val.close, 0);
    return { ...d, [smaKey]: sum / period };
  });
}

/**
 * Calculates the Exponential Moving Average (EMA) for a given period.
 * @param data - The array of chart data.
 * @param period - The lookback period (e.g., 20, 50).
 * @returns The data array with the 'ema' property added.
 */
export function calculateEMA(data: ChartData[], period: number): ChartData[] {
  const emaKey = `ema${period}` as keyof ChartData;
  const k = 2 / (period + 1);
  let ema: number | undefined = undefined;

  return data.map((d, i) => {
    if (i < period - 1) return d;
    if (ema === undefined) {
      // Start with the SMA for the first calculation
      const slice = data.slice(i - period + 1, i + 1);
      ema = slice.reduce((acc, val) => acc + val.close, 0) / period;
    } else {
      ema = (d.close - ema) * k + ema;
    }
    return { ...d, [emaKey]: ema };
  });
}

/**
 * Calculates the Relative Strength Index (RSI).
 * @param data - The array of chart data.
 * @param period - The lookback period, typically 14.
 * @returns The data array with the 'rsi' property added.
 */
export function calculateRSI(data: ChartData[], period: number = 14): ChartData[] {
  let avgGain = 0;
  let avgLoss = 0;

  return data.map((d, i) => {
    if (i === 0) return d;
    const change = d.close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    if (i < period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      return d;
    }
    
    if (i === period) {
      // First RSI calculation
      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      return { ...d, rsi };
    }

    // Subsequent RSI calculations
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return { ...d, rsi };
  });
}

/**
 * Calculates the Moving Average Convergence Divergence (MACD).
 * @param data - The array of chart data.
 * @returns The data array with 'macd', 'signal', and 'histogram' properties.
 */
export function calculateMACD(data: ChartData[]): ChartData[] {
  let dataWithEma12 = calculateEMA(data, 12);
  let dataWithEma26 = calculateEMA(dataWithEma12, 26);

  let dataWithMacd = dataWithEma26.map(d => {
    if (d.ema12 && d.ema26) {
      return { ...d, macd: d.ema12 - d.ema26 };
    }
    return d;
  });

  // Calculate Signal Line (9-period EMA of MACD)
  const k = 2 / (9 + 1);
  let signalEma: number | undefined = undefined;

  return dataWithMacd.map((d, i) => {
      if (!d.macd) return d;

      if (signalEma === undefined) {
          const slice = dataWithMacd.slice(0, i + 1).filter(p => p.macd);
          if (slice.length === 9) {
              signalEma = slice.reduce((acc, val) => acc + (val.macd || 0), 0) / 9;
          }
      } else {
          signalEma = (d.macd - signalEma) * k + signalEma;
      }
      
      if (signalEma) {
          return { ...d, signal: signalEma, histogram: d.macd - signalEma };
      }
      return d;
  });
}
