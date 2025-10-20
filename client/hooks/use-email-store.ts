"use client"

import { create } from "zustand"

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  body?: string
  timestamp: string
  isRead: boolean
  isStarred: boolean
  category?: string
  avatar?: string
  accountId?: string
  folder?: string
  to?: string[]
  date?: string
  aiCategory?: string
  indexedAt?: string
}

interface Notification {
  id: string
  type: "new_email" | "reply" | "mention"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface EmailStore {
  emails: Email[]
  notifications: Notification[]
  selectedEmailId: string | null
  unreadCount: number
  isLoading: boolean
  error: string | null

  setEmails: (emails: Email[]) => void
  addEmail: (email: Email) => void
  updateEmail: (id: string, updates: Partial<Email>) => void
  markAsRead: (id: string) => void
  toggleStar: (id: string) => void

  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void

  setSelectedEmail: (id: string | null) => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useEmailStore = create<EmailStore>((set) => ({
  emails: [],
  notifications: [],
  selectedEmailId: null,
  unreadCount: 0,
  isLoading: false,
  error: null,

  setEmails: (emails) =>
    set(() => ({
      emails,
      unreadCount: emails.filter((e) => !e.isRead).length,
    })),

  addEmail: (email) =>
    set((state) => ({
      emails: [email, ...state.emails],
      unreadCount: state.unreadCount + 1,
    })),

  updateEmail: (id, updates) =>
    set((state) => ({
      emails: state.emails.map((email) => (email.id === id ? { ...email, ...updates } : email)),
    })),

  markAsRead: (id) =>
    set((state) => {
      const email = state.emails.find((e) => e.id === id)
      return {
        emails: state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)),
        unreadCount: email && !email.isRead ? state.unreadCount - 1 : state.unreadCount,
      }
    }),

  toggleStar: (id) =>
    set((state) => ({
      emails: state.emails.map((email) =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      ),
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: Math.random().toString(),
          timestamp: new Date(),
          read: false,
          ...notification,
        },
        ...state.notifications,
      ],
    })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  clearNotifications: () => set({ notifications: [] }),

  setSelectedEmail: (id) => set({ selectedEmailId: id }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}))
