"use client"

import { useState } from "react"
import { Sparkles, Copy, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

interface SuggestedRepliesProps {
  emailId: string
  emailSubject: string
  onSelectReply: (reply: string) => void
}

export function SuggestedReplies({ emailId, onSelectReply }: SuggestedRepliesProps) {
  const [selectedReply, setSelectedReply] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aiReply, setAiReply] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateReply = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.emails.suggestReply(emailId, true)
      setAiReply(response.data.reply)
    } catch (error) {
      console.error("Error fetching AI reply:", error)
      setError("Failed to generate AI reply")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (reply: string) => {
    navigator.clipboard.writeText(reply)
    setCopiedId(0)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSelect = (reply: string) => {
    setSelectedReply(reply)
    onSelectReply(reply)
  }

  if (isLoading) {
    return (
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">AI Suggested Reply</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-gradient-to-br from-muted to-muted/50 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">Generating AI reply...</p>
            <p className="text-xs text-muted-foreground">
              Using advanced RAG to craft the perfect response
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">AI Suggested Reply</p>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleGenerateReply} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (aiReply) {
    return (
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <p className="text-sm font-semibold text-foreground">AI Suggested Reply</p>
        </div>
        <div className="space-y-2">
          <div
            className={cn(
              "p-3 rounded-lg border transition-all cursor-pointer",
              selectedReply === aiReply
                ? "border-accent bg-accent/10"
                : "border-border bg-muted hover:bg-muted/80"
            )}
            onClick={() => handleSelect(aiReply)}
          >
            <p className="text-sm text-foreground mb-2">{aiReply}</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopy(aiReply)
                }}
              >
                {copiedId === 0 ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
              {selectedReply === aiReply && (
                <span className="text-xs text-accent font-medium">Selected</span>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleGenerateReply} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <p className="text-sm font-semibold text-foreground">AI Suggested Reply</p>
      </div>
      <Button onClick={handleGenerateReply} className="w-full gap-2" variant="outline">
        <Sparkles className="h-4 w-4" />
        Generate AI Reply
      </Button>
    </div>
  )
}
