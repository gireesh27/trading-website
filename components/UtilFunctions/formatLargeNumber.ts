export function formatLargeNumber(num: number): string {
  if (num === null || isNaN(num)) return "N/A";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 1_000_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000_000).toFixed(2)}T`;
  } else if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(2)}B`;
  } else if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(2)}M`;
  } else if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(2)}K`;
  } else {
    return `${sign}${absNum.toFixed(2)}`;
  }
}
