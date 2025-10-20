const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
export interface EmailResponse {
  id: string
  accountId: string
  folder: string
  subject: string
  body: string
  from: string
  to: string[]
  date: string
  aiCategory: string
  indexedAt: string
}

export interface SearchEmailsResponse {
  success: boolean
  data: {
    emails: EmailResponse[]
    pagination: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
    filters?: {
      q?: string
      account?: string
      folder?: string
      category?: string
    }
  }
}

export interface SuggestReplyResponse {
  success: boolean
  data: {
    reply: string
    context: string[]
  }
}

export interface Account {
  user: string
  host: string
  port: number
  tls: boolean
}

export interface HealthResponse {
  status: string
  timestamp: string
  uptime: number
}

export interface DetailedHealthResponse extends HealthResponse {
  elasticsearch: {
    status: "connected" | "disconnected"
    cluster?: string
  }
  qdrant: {
    status: "connected" | "disconnected"
  }
  imap: {
    connectedAccounts: number
    accounts: Array<{
      email: string
      status: "connected" | "disconnected"
    }>
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: unknown
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError(error instanceof Error ? error.message : "Unknown error occurred", 0)
  }
}

export const emailAPI = {
  async getAll(page: number = 1, pageSize: number = 20): Promise<SearchEmailsResponse> {
    return apiFetch<SearchEmailsResponse>(`/api/emails?page=${page}&pageSize=${pageSize}`)
  },

  async search(params: {
    q?: string
    account?: string
    folder?: string
    category?: string
    page?: number
    pageSize?: number
  }): Promise<SearchEmailsResponse> {
    const searchParams = new URLSearchParams()

    if (params.q) searchParams.append("q", params.q)
    if (params.account) searchParams.append("account", params.account)
    if (params.folder) searchParams.append("folder", params.folder)
    if (params.category) searchParams.append("category", params.category)
    if (params.page) searchParams.append("page", params.page.toString())
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())

    return apiFetch<SearchEmailsResponse>(`/api/emails/search?${searchParams.toString()}`)
  },

  async getById(id: string): Promise<{ success: boolean; data: { email: EmailResponse } }> {
    return apiFetch<{ success: boolean; data: { email: EmailResponse } }>(
      `/api/emails/${encodeURIComponent(id)}`
    )
  },

  async suggestReply(
    emailId: string,
    includeContext: boolean = true
  ): Promise<SuggestReplyResponse> {
    return apiFetch<SuggestReplyResponse>(
      `/api/emails/${encodeURIComponent(emailId)}/suggest-reply`,
      {
        method: "POST",
        body: JSON.stringify({ includeContext }),
      }
    )
  },
}

export const accountAPI = {
  async getAll(): Promise<{ email: string; host: string; port: number }[]> {
    const response = await apiFetch<{
      success: boolean
      data: { accounts: { email: string; host: string; port: number }[] }
    }>("/api/accounts")
    return response.data.accounts
  },
}

export const healthAPI = {
  async check(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>("/api/health")
  },

  async detailed(): Promise<DetailedHealthResponse> {
    return apiFetch<DetailedHealthResponse>("/api/health/detailed")
  },

  async ready(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>("/api/health/ready")
  },

  async live(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>("/api/health/live")
  },
}

export interface Notification {
  id: string
  type: "new_email" | "reply" | "mention" | "system"
  title: string
  message: string
  emailId?: string
  timestamp: string
  read: boolean
}

export interface NotificationsResponse {
  success: boolean
  data: {
    notifications: Notification[]
    count?: number
  }
}

export const notificationAPI = {
  async getAll(): Promise<NotificationsResponse> {
    return apiFetch<NotificationsResponse>("/api/notifications")
  },

  async getUnread(): Promise<NotificationsResponse> {
    return apiFetch<NotificationsResponse>("/api/notifications/unread")
  },

  async markAsRead(id: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(`/api/notifications/${id}/read`, {
      method: "PUT",
    })
  },

  async clearAll(): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/notifications", {
      method: "DELETE",
    })
  },
}

export const api = {
  emails: emailAPI,
  accounts: accountAPI,
  health: healthAPI,
  notifications: notificationAPI,
}

export default api
