"use client"

import type React from "react"

import {
  Tag,
  AlertCircle,
  Clock,
  ThumbsUp,
  Calendar,
  ThumbsDown,
  Briefcase,
  Newspaper,
  Ban,
  Sun,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailCategoriesProps {
  category: string
}

// Map backend AI categories to frontend display
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  Interested: {
    icon: <ThumbsUp className="h-4 w-4" />,
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Interested",
  },
  "Meeting Booked": {
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    label: "Meeting Booked",
  },
  "Not Interested": {
    icon: <ThumbsDown className="h-4 w-4" />,
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Not Interested",
  },
  "Follow Up": {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    label: "Follow Up",
  },
  "Job Opportunity": {
    icon: <Briefcase className="h-4 w-4" />,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    label: "Job Opportunity",
  },
  Newsletter: {
    icon: <Newspaper className="h-4 w-4" />,
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    label: "Newsletter",
  },
  Spam: {
    icon: <Ban className="h-4 w-4" />,
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    label: "Spam",
  },
  "Out of Office": {
    icon: <Sun className="h-4 w-4" />,
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    label: "Out of Office",
  },
  Important: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Important",
  },
  Informational: {
    icon: <Info className="h-4 w-4" />,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    label: "Informational",
  },
  Uncategorized: {
    icon: <Tag className="h-4 w-4" />,
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    label: "Uncategorized",
  },
}

export function EmailCategories({ category }: EmailCategoriesProps) {
  const config = categoryConfig[category] || categoryConfig["Uncategorized"]

  return (
    <div className="space-y-2 mb-4 pb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase">AI Category</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm",
            config.color
          )}
        >
          {config.icon}
          <span className="font-medium">{config.label}</span>
        </div>
      </div>
    </div>
  )
}
