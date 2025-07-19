"use client"
import { useWallet } from "@/contexts/wallet-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, PlusCircle, MinusCircle } from "lucide-react";

export function WalletOverview() {
    const { overview } = useWallet();
    if (!overview) return null;
    
    const renderPL = (pl: {amount: number, percent: number}, label: string) => (
        <div className="text-center">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className={`font-semibold ${pl.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${pl.amount.toFixed(2)} ({pl.percent.toFixed(2)}%)
            </p>
        </div>
    );

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
                <div className="col-span-2 lg:col-span-2">
                    <p className="text-gray-400 text-sm">Current Balance</p>
                    <p className="text-4xl font-bold text-white">${overview.currentBalance.toLocaleString()}</p>
                    <div className="flex space-x-2 mt-4">
                        <Button className="bg-green-600 hover:bg-green-700"><PlusCircle className="h-4 w-4 mr-2"/>Deposit</Button>
                        <Button variant="outline" className="bg-transparent border-gray-600"><MinusCircle className="h-4 w-4 mr-2"/>Withdraw</Button>
                    </div>
                </div>
                {renderPL(overview.dailyPL, "Daily P&L")}
                {renderPL(overview.weeklyPL, "Weekly P&L")}
                {renderPL(overview.allTimePL, "All-Time P&L")}
                <div className="text-center">
                    <p className="text-gray-400 text-sm">Available Cash</p>
                    <p className="font-semibold text-white">${overview.availableCash.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
    )
}