// File: modules/crypto/components/MarketOverview.tsx

interface Props {
  activeTab: "overview" | "table";
  setActiveTab: (tab: "overview" | "table") => void;
}

export function MarketOverview({ activeTab, setActiveTab }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-white mb-2">Crypto Market</h1>
      <p className="text-gray-400 mb-4">
        Explore market trends, view charts and track top cryptocurrencies.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "overview" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("table")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === "table" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Table View
        </button>
      </div>
    </div>
  );
}