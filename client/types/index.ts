export interface Account {
  email: string
  host: string
  port: number
}

export interface Email {
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

export interface Notification {
  id: string
  type: "new_email" | "reply" | "mention"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export interface Attachment {
  id: string
  name: string
  size: string
  type: string
}

export type AICategory =
  | "Interested"
  | "Meeting Booked"
  | "Not Interested"
  | "Follow Up"
  | "Job Opportunity"
  | "Newsletter"
  | "Spam"
  | "Out of Office"
  | "Important"
  | "Informational"
  | "Uncategorized"
