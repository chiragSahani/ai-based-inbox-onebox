"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, MessageSquare, AtSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api, Notification } from "@/lib/api"

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const unreadNotifications = notifications.filter((n) => !n.read)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await api.notifications.getAll()
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const clearNotifications = async () => {
    try {
      await api.notifications.clearAll()
      setNotifications([])
    } catch (error) {
      console.error("Failed to clear notifications:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_email":
        return <Mail className="h-4 w-4" />
      case "reply":
        return <MessageSquare className="h-4 w-4" />
      case "mention":
        return <AtSign className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadNotifications.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearNotifications()}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                      !notification.read && "bg-muted/30"
                    )}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 text-accent">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 h-2 w-2 bg-accent rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
