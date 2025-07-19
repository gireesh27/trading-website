"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useMarketData } from "./enhanced-market-data-context"

interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  investedValue: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
  sector?: string
}

interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalPnLPercent: number
  dayChange: number
  dayChangePercent: number
  sectorAllocation: { [sector: string]: number }
}

interface HoldingsContextType {
  holdings: Holding[]
  portfolioSummary: PortfolioSummary
  isLoading: boolean
  refreshHoldings: () => Promise<void>
  getHoldingBySymbol: (symbol: string) => Holding | undefined
}

const HoldingsContext = createContext<HoldingsContextType | undefined>(undefined)

export function HoldingsProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    sectorAllocation: {},
  })
  const [isLoading, setIsLoading] = useState(true)
  const { stocks } = useMarketData()

  useEffect(() => {
    loadHoldings()
  }, [])

  useEffect(() => {
    if (holdings.length > 0 && stocks.length > 0) {
      updateHoldingsWithCurrentPrices()
    }
  }, [stocks])

  const loadHoldings = async () => {
    try {
      setIsLoading(true)

      // Simulate loading holdings from API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockHoldings: Holding[] = [
        {
          id: "holding_001",
          symbol: "RELIANCE",
          name: "Reliance Industries Ltd",
          quantity: 10,
          averagePrice: 2400.0,
          currentPrice: 2456.75,
          totalValue: 24567.5,
          investedValue: 24000.0,
          pnl: 567.5,
          pnlPercent: 2.36,
          dayChange: 234.5,
          dayChangePercent: 0.96,
          sector: "Oil & Gas",
        },
        {
          id: "holding_002",
          symbol: "TCS",
          name: "Tata Consultancy Services",
          quantity: 5,
          averagePrice: 3600.0,
          currentPrice: 3567.8,
          totalValue: 17839.0,
          investedValue: 18000.0,
          pnl: -161.0,
          pnlPercent: -0.89,
          dayChange: -226.0,
          dayChangePercent: -1.25,
          sector: "IT Services",
        },
        {
          id: "holding_003",
          symbol: "HDFCBANK",
          name: "HDFC Bank Ltd",
          quantity: 15,
          averagePrice: 1650.0,
          currentPrice: 1678.45,
          totalValue: 25176.75,
          investedValue: 24750.0,
          pnl: 426.75,
          pnlPercent: 1.72,
          dayChange: 184.5,
          dayChangePercent: 0.74,
          sector: "Banking",
        },
      ]

      setHoldings(mockHoldings)
      calculatePortfolioSummary(mockHoldings)
    } catch (error) {
      console.error("Failed to load holdings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateHoldingsWithCurrentPrices = () => {
    const updatedHoldings = holdings.map((holding) => {
      const stock = stocks.find((s) => s.symbol === holding.symbol)
      if (stock) {
        const currentPrice = stock.price
        const totalValue = holding.quantity * currentPrice
        const pnl = totalValue - holding.investedValue
        const pnlPercent = (pnl / holding.investedValue) * 100
        const dayChange = holding.quantity * stock.change
        const dayChangePercent = stock.changePercent

        return {
          ...holding,
          currentPrice,
          totalValue,
          pnl,
          pnlPercent,
          dayChange,
          dayChangePercent,
        }
      }
      return holding
    })

    setHoldings(updatedHoldings)
    calculatePortfolioSummary(updatedHoldings)
  }

  const calculatePortfolioSummary = (holdingsData: Holding[]) => {
    const totalValue = holdingsData.reduce((sum, holding) => sum + holding.totalValue, 0)
    const totalInvested = holdingsData.reduce((sum, holding) => sum + holding.investedValue, 0)
    const totalPnL = totalValue - totalInvested
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
    const dayChange = holdingsData.reduce((sum, holding) => sum + holding.dayChange, 0)
    const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0

    // Calculate sector allocation
    const sectorAllocation: { [sector: string]: number } = {}
    holdingsData.forEach((holding) => {
      if (holding.sector) {
        sectorAllocation[holding.sector] = (sectorAllocation[holding.sector] || 0) + holding.totalValue
      }
    })

    setPortfolioSummary({
      totalValue,
      totalInvested,
      totalPnL,
      totalPnLPercent,
      dayChange,
      dayChangePercent,
      sectorAllocation,
    })
  }

  const refreshHoldings = async () => {
    await loadHoldings()
  }

  const getHoldingBySymbol = (symbol: string): Holding | undefined => {
    return holdings.find((holding) => holding.symbol === symbol)
  }

  return (
    <HoldingsContext.Provider
      value={{
        holdings,
        portfolioSummary,
        isLoading,
        refreshHoldings,
        getHoldingBySymbol,
      }}
    >
      {children}
    </HoldingsContext.Provider>
  )
}

export function useHoldings() {
  const context = useContext(HoldingsContext)
  if (context === undefined) {
    throw new Error("useHoldings must be used within a HoldingsProvider")
  }
  return context
}
