import { EmailResponse } from "./api"
import { CATEGORY_CONFIG, FOLDER_ICONS } from "./constants"

export function transformBackendEmail(backendEmail: EmailResponse) {
  const preview = backendEmail.body
    ? backendEmail.body.replace(/<[^>]*>/g, "").substring(0, 100) + "..."
    : "No content"

  const getInitials = (email: string) => {
    const name = email.split("@")[0]
    return name.substring(0, 2).toUpperCase()
  }

  return {
    id: backendEmail.id,
    from: backendEmail.from,
    subject: backendEmail.subject || "(No Subject)",
    preview,
    body: backendEmail.body,
    timestamp: new Date(backendEmail.date).toLocaleString(),
    isRead: false,
    isStarred: false,
    category: backendEmail.aiCategory,
    avatar: getInitials(backendEmail.from),
    accountId: backendEmail.accountId,
    folder: backendEmail.folder,
    to: backendEmail.to,
    date: backendEmail.date,
    aiCategory: backendEmail.aiCategory,
    indexedAt: backendEmail.indexedAt,
  }
}

export function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG["Uncategorized"]
}

export function formatEmailDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = diffInMs / (1000 * 60 * 60)
  const diffInDays = diffInHours / 24

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInMs / (1000 * 60))
    return `${minutes}m ago`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else if (diffInDays < 7) {
    return `${Math.floor(diffInDays)}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

export function extractPlainText(html: string): string {
  let text = html.replace(/<[^>]*>/g, "")
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  return text.trim()
}

export function getFolderIcon(folder: string) {
  return FOLDER_ICONS[folder as keyof typeof FOLDER_ICONS] || FOLDER_ICONS.INBOX
}
