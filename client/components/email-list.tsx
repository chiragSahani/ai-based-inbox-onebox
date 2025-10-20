"use client"

import { useMemo } from "react"
import { Mail, Star, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useEmailStore } from "@/hooks/use-email-store"
import { formatEmailDate } from "@/lib/utils-email"

interface EmailListProps {
  selectedEmailId: string | null
  onSelectEmail: (id: string) => void
  searchQuery: string
  selectedAccount: string
}

export function EmailList({ selectedEmailId, onSelectEmail, searchQuery }: EmailListProps) {
  const { emails, isLoading, toggleStar, unreadCount } = useEmailStore()

  const filteredEmails = useMemo(() => {
    return emails
  }, [emails])

  return (
    <div className="w-96 border-r border-border bg-card flex flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inbox</h2>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-8 w-8 mb-4 animate-spin" />
            <p className="text-sm">Loading emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No emails found</p>
            {searchQuery && <p className="text-xs mt-2">Try adjusting your search</p>}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email.id)}
                className={cn(
                  "w-full px-4 py-3 cursor-pointer transition-colors hover:bg-muted/80",
                  selectedEmailId === email.id && "bg-muted border-l-2 border-primary",
                  !email.isRead && "bg-muted/50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">{email.avatar}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm truncate",
                          !email.isRead ? "font-semibold" : "font-medium"
                        )}
                      >
                        {email.from.split("@")[0]}
                      </p>
                      {email.category && (
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary flex-shrink-0">
                          {email.category}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate mt-1",
                        !email.isRead ? "text-foreground font-medium" : "text-muted-foreground"
                      )}
                    >
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{email.preview}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {email.date ? formatEmailDate(email.date) : email.timestamp}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(email.id)
                      }}
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label={email.isStarred ? "Unstar email" : "Star email"}
                    >
                      <Star
                        className={cn("h-4 w-4", email.isStarred && "fill-accent text-accent")}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
