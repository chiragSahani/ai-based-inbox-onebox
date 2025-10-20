"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  Archive,
  Trash2,
  Star,
  MoreVertical,
  Reply,
  ReplyAll,
  Forward,
  Download,
  Paperclip,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SuggestedReplies } from "@/components/suggested-replies"
import { EmailCategories } from "@/components/email-categories"
import { cn } from "@/lib/utils"
import { api, EmailResponse } from "@/lib/api"

interface EmailDetailProps {
  emailId: string
  onBack?: () => void
}

export function EmailDetail({ emailId, onBack }: EmailDetailProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isStarred, setIsStarred] = useState(false)
  const [emailData, setEmailData] = useState<EmailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api.emails.getById(emailId)
        setEmailData(response.data.email)
      } catch (err) {
        console.error("Error fetching email:", err)
        setError("Failed to load email")
      } finally {
        setIsLoading(false)
      }
    }

    if (emailId) {
      fetchEmail()
    }
  }, [emailId])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">Loading email...</p>
      </div>
    )
  }

  if (error || !emailData) {
    return (
      <div className="flex-1 flex flex-col bg-background items-center justify-center">
        <p className="text-sm text-red-400">{error || "Email not found"}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-lg font-semibold text-foreground">{emailData.subject || "(No Subject)"}</h2>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                From: <span className="text-foreground font-medium">{emailData.from}</span>
              </p>
              <p className="text-muted-foreground">
                To: <span className="text-foreground font-medium">{emailData.to?.join(", ") || "N/A"}</span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-2">{new Date(emailData.date).toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsStarred(!isStarred)}
              title={isStarred ? "Remove star" : "Add star"}
            >
              <Star className={cn("h-5 w-5", isStarred && "fill-accent text-accent")} />
            </Button>
            <Button variant="ghost" size="icon" title="More options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {emailData.aiCategory && <EmailCategories category={emailData.aiCategory} />}

        <div className="mb-6">
          {emailData.body && emailData.body.includes("<") ? (
            <div
              className="text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: emailData.body }}
            />
          ) : (
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{emailData.body}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card px-6 py-4 max-h-96 overflow-y-auto">
        {!isReplying ? (
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsReplying(true)} className="gap-2">
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ReplyAll className="h-4 w-4" />
              Reply All
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Forward className="h-4 w-4" />
              Forward
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="icon">
              <Archive className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <SuggestedReplies emailId={emailId} emailSubject={emailData.subject || ""} onSelectReply={(reply) => setReplyText(reply)} />

            <div className="bg-muted rounded-lg p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Reply to {emailData.from}</p>
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-24 bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button className="gap-2">Send</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReplying(false)
                  setReplyText("")
                }}
              >
                Cancel
              </Button>
              <Button variant="ghost" size="icon" title="Attach file">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
