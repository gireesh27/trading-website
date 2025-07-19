"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Bell, TrendingUp, TrendingDown } from 'lucide-react'
import { useWatchlist } from '@/contexts/watchlist-context'

interface CreateAlertDialogProps {
  symbol: string
  currentPrice: number
}

export function CreateAlertDialog({ symbol, currentPrice }: CreateAlertDialogProps) {
  const { createAlert } = useWatchlist()
  const [open, setOpen] = useState(false)
  const [alertType, setAlertType] = useState<'above' | 'below'>('above')
  const [targetPrice, setTargetPrice] = useState('')

  const handleCreateAlert = () => {
    const price = parseFloat(targetPrice)
    if (isNaN(price) || price <= 0) return

    createAlert(symbol, alertType, price)
    setOpen(false)
    setTargetPrice('')
    setAlertType('above')
  }

  const suggestedPrices = {
    above: [
      currentPrice * 1.05,
      currentPrice * 1.10,
      currentPrice * 1.20
    ],
    below: [
      currentPrice * 0.95,
      currentPrice * 0.90,
      currentPrice * 0.80
    ]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-yellow-400 p-1 h-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Bell className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Create Price Alert</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">{symbol}</span>
              <span className="text-gray-300">${currentPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">Alert Type</Label>
            <RadioGroup
              value={alertType}
              onValueChange={(value: 'above' | 'below') => setAlertType(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="above" id="above" className="border-gray-500" />
                <Label htmlFor="above" className="text-gray-300 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                  Above
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="below" id="below" className="border-gray-500" />
                <Label htmlFor="below" className="text-gray-300 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                  Below
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Target Price</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter price..."
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 text-sm">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {suggestedPrices[alertType].map((price, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetPrice(price.toFixed(2))}
                  className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700"
                >
                  ${price.toFixed(2)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAlert}
              disabled={!targetPrice || isNaN(parseFloat(targetPrice))}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Create Alert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}