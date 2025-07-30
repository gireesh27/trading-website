import React, { useEffect, useState } from "react";
import { useMarketData } from "@/contexts/enhanced-market-data-context";
import { cn } from "@/lib/utils";
import { formatLargeNumber } from "@/components/UtilFunctions/formatLargeNumber";
import { formatLabel } from "@/components/UtilFunctions/formatLabel";
interface FinancialEntry {
  concept: string;
  unit: string;
  label: string;
  value: number | null;
}

interface StockFinancialsReportDisplayProps {
  symbol: string;
}

function extractEntries(
  sections: Record<string, Record<string, FinancialEntry> | undefined>
): Record<string, FinancialEntry[]> {
  const result: Record<string, FinancialEntry[]> = {};

  for (const [sectionName, entries] of Object.entries(sections)) {
    if (!entries) continue;

    const cleaned = Object.values(entries).filter(
      (entry): entry is FinancialEntry =>
        entry &&
        typeof entry === "object" &&
        "label" in entry &&
        "value" in entry &&
        typeof entry.label === "string" &&
        !/^\d+$/.test(entry.label)
    );

    result[sectionName] = cleaned;
  }

  return result;
}

export default function StockFinancialsReportDisplay({
  symbol,
}: StockFinancialsReportDisplayProps) {
  const { getFinancialsReported } = useMarketData();
  const [reportSections, setReportSections] = useState<
    Record<string, FinancialEntry[]>
  >({});
  const [meta, setMeta] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const reports = await getFinancialsReported(symbol);
        if (Array.isArray(reports) && reports.length > 0) {
          const latest = reports[0];
          const extracted = extractEntries({
            "Balance Sheet": latest.report?.bs,
            "Income Statement": latest.report?.ic,
            "Cash Flow Statement": latest.report?.cf,
          });

          setReportSections(extracted);

          const initialVisible: Record<string, number> = {};
          Object.keys(extracted).forEach((section) => {
            initialVisible[section] = 6;
          });
          setVisibleCount(initialVisible);

          setMeta({
            symbol: latest.symbol,
            year: latest.year,
            quarter: latest.quarter,
            reportDate: latest.reportDate,
            cik: latest.cik,
            form: latest.form,
            filedDate: latest.filedDate,
          });
        } else {
          setReportSections({});
        }
      } catch (err: any) {
        setError(`Failed to fetch financial report: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [symbol]);


  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!Object.keys(reportSections).length)
    return <p className="text-gray-400">No financial data available.</p>;

  return (
    <div className="p-4  rounded-lg space-y-6 ">
      <div className="bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-purple-500/30 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/10 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-wide mb-2 drop-shadow-lg">
          🚀 Financial Report for{" "}
          <span className="uppercase text-blue-300">{meta.symbol}</span>
        </h2>
        <p className="text-base text-gray-300 italic font-light">
          {meta.year} Q{meta.quarter} ·{" "}
          <span className="text-sm font-medium text-white">
            Reported on {meta.reportDate || "N/A"}
          </span>
        </p>
      </div>

      {Object.entries(reportSections).map(([sectionTitle, entries]) => (
        <div key={sectionTitle} className="mb-10 ">
          <h3 className="text-2xl font-semibold mb-4 text-blue-400 border-b border-blue-500 pb-2">
            {sectionTitle}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-xl p-4">
            {entries
              .slice(0, visibleCount[sectionTitle] || 9)
              .map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-md transition transform hover:scale-[1.02]"
                >
                  <h4 className="text-lg text-gray-200 font-semibold mb-2">
                    {formatLabel(entry.concept)}
                  </h4>

                  <div className="text-sm text-gray-400 mb-1">
                    <span className="mr-2">Label:</span>
                    {entry.label || "N/A"}
                  </div>

                  <div className="text-sm text-gray-400 mb-1">
                    <span className="mr-2">Unit:</span>
                    {entry.unit || "N/A"}
                  </div>

                  <div className="text-base font-bold text-right text-green-400 mt-4">
                    {formatLargeNumber(Number(entry.value))}
                  </div>
                </div>
              ))}
          </div>

          {entries.length > 9 &&
            (visibleCount[sectionTitle] || 9) < entries.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() =>
                    setVisibleCount((prev) => ({
                      ...prev,
                      [sectionTitle]: (prev[sectionTitle] ?? 6) + 6,
                    }))
                  }
                  className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-2 px-5 rounded-xl hover:opacity-90 transition shadow-md text-sm font-semibold"
                >
                  View More
                </button>
              </div>
            )}
        </div>
      ))}
    </div>
  );
}
