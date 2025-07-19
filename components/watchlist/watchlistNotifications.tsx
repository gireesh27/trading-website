"use client"
import { useEffect, useRef } from 'react'
import { useWatchlist } from '@/contexts/watchlist-context'
import { PriceAlert } from '@/types/watchlistypes'

export function useWatchlistNotifications() {
  const { watchlists } = useWatchlist()
  const previousPricesRef = useRef<Record<string, number>>({})
  const notificationPermission = useRef<NotificationPermission>('default')

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        notificationPermission.current = permission
      })
    }
  }, [])

  useEffect(() => {
    // Check for triggered alerts
    watchlists.forEach(watchlist => {
      watchlist.items.forEach(item => {
        const previousPrice = previousPricesRef.current[item.symbol]
        
        if (previousPrice !== undefined && item.alerts) {
          item.alerts.forEach(alert => {
            if (!alert.isActive || alert.triggeredAt) return

            const shouldTrigger = 
              (alert.type === 'above' && previousPrice < alert.price && item.price >= alert.price) ||
              (alert.type === 'below' && previousPrice > alert.price && item.price <= alert.price)

            if (shouldTrigger) {
              triggerAlert(alert, item.price)
            }
          })
        }

        previousPricesRef.current[item.symbol] = item.price
      })
    })
  }, [watchlists])

  const triggerAlert = (alert: PriceAlert, currentPrice: number) => {
    // Show browser notification
    if (notificationPermission.current === 'granted') {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: `${alert.symbol} is now ${alert.type} $${alert.price.toFixed(2)} (Current: $${currentPrice.toFixed(2)})`,
        icon: '/favicon.ico',
        tag: alert.id
      })
    }

    // Play sound (optional)
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.play().catch(() => {
        // Ignore audio play errors
      })
    } catch (error) {
      // Ignore audio errors
    }

    // Update alert as triggered
    // This would typically update the alert in the context
    console.log('Alert triggered:', alert)
  }

  return {
    notificationPermission: notificationPermission.current
  }
}
