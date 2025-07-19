"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  BellOff, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Plus,
  Settings
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Alert {
  id: string
  symbol: string
  type: 'above' | 'below'
  price: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
}

export function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'above' as 'above' | 'below',
    price: ''
  })

  // Mock alerts data
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        symbol: 'AAPL',
        type: 'above',
        price: 180.00,
        isActive: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: '2',
        symbol: 'TSLA',
        type: 'below',
        price: 240.00,
        isActive: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
      },
      {
        id: '3',
        symbol: 'BTC',
        type: 'above',
        price: 45000,
        isActive: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
      }
    ]
    setAlerts(mockAlerts)
  }, [])

  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.triggeredAt)
  const triggeredAlerts = alerts.filter(alert => alert.triggeredAt)

  const createAlert = () => {
    if (!newAlert.symbol || !newAlert.price) return

    const alert: Alert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      price: parseFloat(newAlert.price),
      isActive: true,
      createdAt: new Date()
    }

    setAlerts(prev => [...prev, alert])
    setNewAlert({ symbol: '', type: 'above', price: '' })
    setIsCreateDialogOpen(false)
  }

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ))
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alerts</span>
            <Badge variant="secondary" className="bg-blue-600 text-xs">
              {activeAlerts.length}
            </Badge>
          </CardTitle>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Price Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol" className="text-gray-300">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., AAPL"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-gray-300">Alert Type</Label>
                  <Select value={newAlert.type} onValueChange={(value: 'above' | 'below') => 
                    setNewAlert(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="above">Price Above</SelectItem>
                      <SelectItem value="below">Price Below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price" className="text-gray-300">Target Price</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newAlert.price}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createAlert} className="bg-blue-600 hover:bg-blue-700 flex-1">
                    Create Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 mb-2">No alerts set</p>
              <p className="text-gray-500 text-sm">Create alerts to get notified of price movements</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-colors ${
                  alert.triggeredAt
                    ? 'bg-green-900/20 border-green-600/30'
                    : alert.isActive
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-800 border-gray-700'
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
                        <span className="text-gray-400 text-xs">
                          {alert.type} ${alert.price.toFixed(2)}
                        </span>
                        {alert.triggeredAt && (
                          <Badge className="bg-green-600 text-xs">
                            Triggered
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {alert.triggeredAt
                            ? `Triggered ${formatTimeAgo(alert.triggeredAt)}`
                            : `Created ${formatTimeAgo(alert.createdAt)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
