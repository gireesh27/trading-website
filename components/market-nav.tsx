'use client'

import Link from 'next/link'

export function MarketNav() {
  return (
    <div className="border-b border-gray-800 overflow-x-auto">
      <div className="flex items-center h-10 px-4 space-x-6">
        <Link href="/summary" className="text-sm text-blue-500 whitespace-nowrap">
          Market summary
        </Link>
        <Link href="/indian-stocks" className="text-sm text-gray-400 hover:text-gray-100 whitespace-nowrap">
          Indian stocks
        </Link>
        <Link href="/world-stocks" className="text-sm text-gray-400 hover:text-gray-100 whitespace-nowrap">
          World stocks
        </Link>
        <Link href="/crypto" className="text-sm text-gray-400 hover:text-gray-100 whitespace-nowrap">
          Crypto
        </Link>
        <Link href="/futures" className="text-sm text-gray-400 hover:text-gray-100 whitespace-nowrap">
          Futures
        </Link>
        <Link href="/forex" className="text-sm text-gray-400 hover:text-gray-100 whitespace-nowrap">
          Forex
        </Link>
      </div>
    </div>
  )
}
