"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Shield, Zap, BarChart3, Smartphone, Globe } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">Loading TradeView...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">TradeView</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost" className="text-white hover:text-blue-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Trade Smarter with
            <span className="text-blue-500"> TradeView</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Professional trading platform with real-time market data, advanced charting, and comprehensive portfolio
            management. Start your trading journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Start Trading Now
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-3 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Trade</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Powerful tools and features designed for both beginners and professional traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle className="text-white">Advanced Charting</CardTitle>
                <CardDescription className="text-gray-400">
                  Professional-grade charts with 50+ technical indicators and drawing tools
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Zap className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle className="text-white">Real-time Data</CardTitle>
                <CardDescription className="text-gray-400">
                  Live market data with WebSocket streaming for instant price updates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Shield className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle className="text-white">Secure Trading</CardTitle>
                <CardDescription className="text-gray-400">
                  Bank-grade security with encrypted transactions and secure wallet management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-orange-500 mb-4" />
                <CardTitle className="text-white">Mobile First</CardTitle>
                <CardDescription className="text-gray-400">
                  Trade on the go with our responsive design optimized for all devices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Globe className="h-12 w-12 text-cyan-500 mb-4" />
                <CardTitle className="text-white">Global Markets</CardTitle>
                <CardDescription className="text-gray-400">
                  Access to Indian and international markets with comprehensive coverage
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">1M+</div>
              <div className="text-gray-300">Active Traders</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-500 mb-2">₹50B+</div>
              <div className="text-gray-300">Daily Volume</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-500 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust TradeView for their investment journey
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">TradeView</span>
              </div>
              <p className="text-gray-400">Professional trading platform for modern investors</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Trading
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Portfolio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Mobile App
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Risk Disclosure
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TradeView. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}