"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useWatchlist } from '@/contexts/watchlist-context'
import { PriceAlert } from '@/types/watchlistypes'

export function AlertsPanel() {
  const { watchlists, deleteAlert } = useWatchlist()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])

  useEffect(() => {
    // Collect all alerts from all watchlists
    const allAlerts: PriceAlert[] = []
    watchlists.forEach(watchlist => {
      watchlist.items.forEach(item => {
        if (item.alerts) {
          allAlerts.push(...item.alerts)
        }
      })
    })
    setAlerts(allAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }, [watchlists])

  const activeAlerts = alerts.filter(alert => alert.isActive)
  const triggeredAlerts = alerts.filter(alert => alert.triggeredAt)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const toggleAlert = (alertId: string) => {
    // Implementation would update alert status
    console.log('Toggle alert:', alertId)
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Price Alerts</span>
          </div>
          <Badge variant="secondary" className="bg-blue-600">
            {activeAlerts.length} active
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <BellOff className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No alerts set</p>
            <p className="text-gray-500 text-sm">Create alerts from your watchlist</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.triggeredAt
                    ? 'bg-green-900/20 border-green-700'
                    : alert.isActive
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-800 border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${
                      alert.type === 'above' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {alert.type === 'above' ? (
                        <TrendingUp className="h-3 w-3 text-white" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold text-sm">
                          {alert.symbol}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {alert.type} ${alert.price.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {alert.triggeredAt
                            ? `Triggered ${formatDate(alert.triggeredAt)}`
                            : `Created ${formatDate(alert.createdAt)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {alert.triggeredAt && (
                      <Badge variant="secondary" className="bg-green-600 text-xs">
                        Triggered
                      </Badge>
                    )}
                    
                    {!alert.triggeredAt && (
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => toggleAlert(alert.id)}
                        className="scale-75"
                      />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-gray-400 hover:text-red-400 p-1 h-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}