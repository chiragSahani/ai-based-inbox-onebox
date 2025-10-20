import {
  AlertCircle,
  Ban,
  Briefcase,
  Calendar,
  Clock,
  Info,
  Inbox,
  Mail,
  Newspaper,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Archive,
  Send,
  FileText,
  Trash2,
} from "lucide-react"

export const AI_CATEGORIES = [
  { id: "all", label: "All Emails", value: undefined, icon: Mail },
  { id: "interested", label: "Interested", value: "Interested", icon: ThumbsUp },
  { id: "meeting", label: "Meeting Booked", value: "Meeting Booked", icon: Calendar },
  {
    id: "not-interested",
    label: "Not Interested",
    value: "Not Interested",
    icon: ThumbsDown,
  },
  { id: "followup", label: "Follow Up", value: "Follow Up", icon: Clock },
  { id: "job", label: "Job Opportunity", value: "Job Opportunity", icon: Briefcase },
  { id: "newsletter", label: "Newsletter", value: "Newsletter", icon: Newspaper },
  { id: "spam", label: "Spam", value: "Spam", icon: Ban },
  { id: "ooo", label: "Out of Office", value: "Out of Office", icon: Sun },
  { id: "important", label: "Important", value: "Important", icon: AlertCircle },
  { id: "info", label: "Informational", value: "Informational", icon: Info },
  { id: "uncategorized", label: "Uncategorized", value: "Uncategorized", icon: Mail },
] as const

export const CATEGORY_CONFIG = {
  Interested: { color: "green", icon: ThumbsUp },
  "Meeting Booked": { color: "blue", icon: Calendar },
  "Not Interested": { color: "red", icon: ThumbsDown },
  "Follow Up": { color: "yellow", icon: Clock },
  "Job Opportunity": { color: "purple", icon: Briefcase },
  Newsletter: { color: "cyan", icon: Newspaper },
  Spam: { color: "gray", icon: Ban },
  "Out of Office": { color: "orange", icon: Sun },
  Important: { color: "red", icon: AlertCircle },
  Informational: { color: "blue", icon: Info },
  Uncategorized: { color: "gray", icon: Mail },
} as const

export const FOLDER_ICONS = {
  INBOX: Inbox,
  Sent: Send,
  Drafts: FileText,
  Trash: Trash2,
  Archive: Archive,
  Spam: Ban,
} as const

export const DEFAULT_PAGE_SIZE = 100
export const API_DELAY_MS = 4000
