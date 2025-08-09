"use client";
import { useEffect, useRef } from "react";
import { useWatchlist } from "@/contexts/watchlist-context";
import { PriceAlert } from "@/types/watchlistypes";

export function useWatchlistNotifications() {
  const { watchlists, fetchWatchlists } = useWatchlist();
  const previousPricesRef = useRef<Record<string, number>>({});
  const notificationPermission = useRef<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        notificationPermission.current = permission;
      });
    }
  }, []);

useEffect(() => {
  watchlists.forEach((watchlist) => {
    watchlist.items.forEach((item) => {
      // Skip if item.price is undefined
      if (item.price === undefined) return;

      const previousPrice = previousPricesRef.current[item.symbol];

      if (previousPrice !== undefined && item.alerts) {
        item.alerts.forEach((alert) => {
          if (!alert.isActive || alert.triggeredAt) return;

          const shouldTrigger =
            (alert.condition === "above" &&
              previousPrice < alert.value &&
              item.price! >= alert.value) ||
            (alert.condition === "below" &&
              previousPrice > alert.value &&
              item.price! <= alert.value);

          if (shouldTrigger) {
            triggerAlert(alert, item.symbol, watchlist._id, item.price!);
          }
        });
      }

      // Save latest price only if it's defined
      previousPricesRef.current[item.symbol] = item.price!;
    });
  });
}, [watchlists]);


  const triggerAlert = async (
    alert: PriceAlert,
    symbol: string,
    watchlistId: string,
    currentPrice: number
  ) => {
    // Show browser notification
    if (notificationPermission.current === "granted") {
      new Notification(`Price Alert: ${alert.symbol}`, {
        body: `${alert.symbol} is now ${alert.type} $${alert.value.toFixed(
          2
        )} (Current: $${currentPrice.toFixed(2)})`,
        icon: "/favicon.ico",
        tag: alert.id,
      });
    }

    // Play alert sound
    try {
      const audio = new Audio("/notification-sound.mp3");
      await audio.play();
    } catch (error) {
      // ignore audio errors
    }

    // 🔄 Update backend
    try {
      await fetch("/api/watchlist/toggle-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchlistId,
          symbol,
          alertId: alert.id,
          isActive: false,
          triggeredAt: new Date().toISOString(),
        }),
      });

      // Refresh watchlists from DB
      fetchWatchlists?.();
    } catch (err) {
      console.error("Failed to update triggered alert:", err);
    }
  };

  return {
    notificationPermission: notificationPermission.current,
  };
}
