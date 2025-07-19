"use client"

import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  PieChart,
  BarChart3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTrading } from "@/contexts/trading-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function EnhancedPortfolioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { portfolio, orders, transactions, updatePortfolio } = useTrading()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }
    updatePortfolio()
  }, [user, router])

  if (!user) {
    return null
  }

  const recentTransactions = transactions.slice(0, 10)
  const pendingOrders = orders.filter((order) => order.status === "pending")
  const filledOrders = orders.filter((order) => order.status === "filled").slice(0, 5)

  return (
    <div className="min-h-screen bg-[#131722]">
      <MainNav />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Portfolio Overview</h1>
            <p className="text-gray-400">Track your investments and performance</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button onClick={updatePortfolio} className="bg-blue-600 hover:bg-blue-700">
              Refresh Portfolio
            </Button>
            <Link href="/markets">
              <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                Explore Markets
              </Button>
            </Link>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${portfolio.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Cash: ${portfolio.availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Gain/Loss</p>
                  <p
                    className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {portfolio.totalGainLoss >= 0 ? "+" : ""}$
                    {portfolio.totalGainLoss.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {portfolio.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className={`text-xs mt-1 ${portfolio.totalGainLossPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                {portfolio.totalGainLossPercent >= 0 ? "+" : ""}
                {portfolio.totalGainLossPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Day Change</p>
                  <p className={`text-2xl font-bold ${portfolio.dayChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {portfolio.dayChange >= 0 ? "+" : ""}${portfolio.dayChange.toFixed(2)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <p className={`text-xs mt-1 ${portfolio.dayChangePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                {portfolio.dayChangePercent >= 0 ? "+" : ""}
                {portfolio.dayChangePercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Positions</p>
                  <p className="text-2xl font-bold text-white">{portfolio.positions.length}</p>
                </div>
                <PieChart className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {portfolio.positions.filter((p) => p.gainLoss > 0).length} profitable
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Your Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.positions.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.positions.map((position) => (
                      <Link key={position.id} href={`/trade/${position.symbol.toLowerCase()}`}>
                        <div className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div>
                                <h3 className="text-white font-medium">{position.symbol}</h3>
                                <p className="text-gray-400 text-sm">{position.name}</p>
                              </div>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {position.quantity} shares
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">${position.totalValue.toFixed(2)}</p>
                              <div
                                className={`flex items-center text-sm ${position.gainLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {position.gainLoss >= 0 ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {position.gainLoss >= 0 ? "+" : ""}${position.gainLoss.toFixed(2)} (
                                {position.gainLossPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Avg Price</p>
                              <p className="text-white">${position.avgPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Current Price</p>
                              <p className="text-white">${position.currentPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Open Date</p>
                              <p className="text-white">{new Date(position.openDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No positions yet</p>
                    <Link href="/markets">
                      <Button className="bg-blue-600 hover:bg-blue-700">Start Trading</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Orders & Transactions */}
          <div className="space-y-6">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Orders ({pendingOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={order.type === "buy" ? "default" : "destructive"}>
                            {order.type.toUpperCase()}
                          </Badge>
                          <span className="text-white text-sm font-medium">{order.symbol}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {order.quantity} shares @{" "}
                        {order.orderType === "market" ? "Market" : `$${order.price?.toFixed(2)}`}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant={transaction.type === "buy" ? "default" : "destructive"}>
                              {transaction.type.toUpperCase()}
                            </Badge>
                            <span className="text-white text-sm font-medium">{transaction.symbol}</span>
                          </div>
                          <span className="text-white text-sm font-medium">${transaction.total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>
                            {transaction.quantity} @ ${transaction.price.toFixed(2)}
                          </span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Allocation */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Cash</span>
                    <span className="text-white">
                      {((portfolio.availableCash / portfolio.totalValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                  {portfolio.positions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between">
                      <span className="text-gray-400">{position.symbol}</span>
                      <span className="text-white">
                        {((position.totalValue / portfolio.totalValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
