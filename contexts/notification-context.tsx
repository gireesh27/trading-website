"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  title: ReactNode;
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      message,
      type,
      createdAt: new Date(),
      isRead: false,
      title: undefined
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Also show a toast for immediate feedback
    toast({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
