"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet-context"
import { Wallet, Plus, Minus, CreditCard, Smartphone, Building, History, TrendingUp, Lock } from "lucide-react"

export function WalletInterface() {
  const { wallet, transactions, isLoading, addMoney, withdrawMoney } = useWallet()
  const [addAmount, setAddAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const handleAddMoney = async () => {
    const amount = Number.parseFloat(addAmount)
    if (amount > 0) {
      const success = await addMoney(amount)
      if (success) {
        setAddAmount("")
      }
    }
  }

  const handleWithdrawMoney = async () => {
    const amount = Number.parseFloat(withdrawAmount)
    if (amount > 0) {
      const success = await withdrawMoney(amount)
      if (success) {
        setWithdrawAmount("")
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-600"
      case "failed":
        return "bg-red-600"
      case "pending":
        return "bg-yellow-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "add":
        return <Plus className="h-4 w-4" />
      case "withdraw":
        return <Minus className="h-4 w-4" />
      case "buy":
        return <CreditCard className="h-4 w-4" />
      case "sell":
        return <CreditCard className="h-4 w-4" />
      default:
        return <History className="h-4 w-4" />
    }
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="h-5 w-5 text-blue-200" />
                  <h3 className="text-sm font-medium text-blue-100">Available Balance</h3>
                </div>
                <p className="text-2xl font-bold text-white">₹{wallet.balance.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locked Balance */}
        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="h-5 w-5 text-orange-200" />
                  <h3 className="text-sm font-medium text-orange-100">Locked Balance</h3>
                </div>
                <p className="text-2xl font-bold text-white">₹{wallet.lockedBalance.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Invested */}
        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-200" />
                  <h3 className="text-sm font-medium text-purple-100">Total Invested</h3>
                </div>
                <p className="text-2xl font-bold text-white">₹{wallet.totalInvested.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Returns */}
        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-200" />
                  <h3 className="text-sm font-medium text-green-100">Total Returns</h3>
                </div>
                <p className="text-2xl font-bold text-white">₹{wallet.totalReturns.toLocaleString("en-IN")}</p>
                <p className="text-xs text-green-200">
                  {((wallet.totalReturns / wallet.totalInvested) * 100).toFixed(2)}% returns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Money */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="h-5 w-5 mr-2 text-green-500" />
            Add Money
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={handleAddMoney}
              disabled={isLoading || !addAmount || Number.parseFloat(addAmount) <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Add Money"}
            </Button>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex space-x-2">
            {[500, 1000, 2000, 5000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setAddAmount(amount.toString())}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                ₹{amount}
              </Button>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex items-center justify-center p-3 bg-gray-700 rounded-lg">
              <Smartphone className="h-5 w-5 mr-2 text-blue-500" />
              <span className="text-sm text-white">UPI</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-gray-700 rounded-lg">
              <CreditCard className="h-5 w-5 mr-2 text-green-500" />
              <span className="text-sm text-white">Cards</span>
            </div>
            <div className="flex items-center justify-center p-3 bg-gray-700 rounded-lg">
              <Building className="h-5 w-5 mr-2 text-purple-500" />
              <span className="text-sm text-white">Net Banking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdraw Money */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Minus className="h-5 w-5 mr-2 text-red-500" />
            Withdraw Money
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={handleWithdrawMoney}
              disabled={
                isLoading ||
                !withdrawAmount ||
                Number.parseFloat(withdrawAmount) <= 0 ||
                Number.parseFloat(withdrawAmount) > wallet.balance
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Withdrawals are processed within 1-2 business days. Available balance: ₹
            {wallet.balance.toLocaleString("en-IN")}
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2 text-blue-500" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-600 rounded-full text-white">{getTypeIcon(transaction.type)}</div>
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{new Date(transaction.timestamp).toLocaleString("en-IN")}</p>
                      {transaction.orderId && <p className="text-xs text-gray-500">Order ID: {transaction.orderId}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        transaction.type === "add" || transaction.type === "sell" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {transaction.type === "add" || transaction.type === "sell" ? "+" : "-"}₹
                      {transaction.amount.toLocaleString("en-IN")}
                    </p>
                    <Badge className={`text-xs ${getStatusColor(transaction.status)} text-white`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
