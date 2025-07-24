// components/stock-details-tabs.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyHoldings, CompanyProfile, CompanyStatistics } from "@/lib/api/stock-api";

interface StockDetailsTabsProps {
  profile: CompanyProfile | null;
  statistics: CompanyStatistics | null;
  holdings: CompanyHoldings | null;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between py-2 border-b border-gray-700">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm text-white font-medium text-right">{value || "N/A"}</span>
  </div>
);

export function StockDetailsTabs({ profile, statistics, holdings }: StockDetailsTabsProps) {
  const assetProfile = profile?.assetProfile;
  const stats = statistics?.defaultKeyStatistics;
  const financialData = statistics?.financialData;
  const topInstitutions = holdings?.institutionOwnership?.ownershipList.slice(0, 10);

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="holders">Top Holders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              {assetProfile?.longBusinessSummary || "No summary available."}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <DetailItem label="Sector" value={assetProfile?.sector} />
              <DetailItem label="Industry" value={assetProfile?.industry} />
              <DetailItem label="Website" value={<a href={assetProfile?.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{assetProfile?.website}</a>} />
              <DetailItem label="Country" value={assetProfile?.country} />
              <DetailItem label="Full-Time Employees" value={assetProfile?.fullTimeEmployees?.toLocaleString()} />
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <DetailItem label="Market Cap" value={stats?.enterpriseValue?.fmt} />
              <DetailItem label="Forward P/E" value={stats?.forwardPE?.fmt} />
              <DetailItem label="Profit Margins" value={stats?.profitMargins?.fmt} />
              <DetailItem label="Shares Outstanding" value={stats?.sharesOutstanding?.fmt} />
              <DetailItem label="Book Value" value={stats?.bookValue?.fmt} />
              <DetailItem label="Price to Book" value={stats?.priceToBook?.fmt} />
              <DetailItem label="52 Week Change" value={stats?.["52WeekChange"]?.fmt} />
              <DetailItem label="Analyst Target Price" value={financialData?.targetMeanPrice?.fmt} />
            </div>
          </TabsContent>

          <TabsContent value="holders" className="mt-4">
            <h4 className="text-md font-semibold mb-2">Top Institutional Holders</h4>
            <div className="text-xs">
              <div className="grid grid-cols-3 font-bold py-2 border-b border-gray-600">
                <span>Holder</span>
                <span className="text-right">% Out</span>
                <span className="text-right">Value</span>
              </div>
              {topInstitutions?.map((holder, i) => (
                <div key={i} className="grid grid-cols-3 py-2 border-b border-gray-800">
                  <span>{holder.organization}</span>
                  <span className="text-right">{holder.pctHeld.fmt}</span>
                  <span className="text-right">{holder.value.fmt}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
