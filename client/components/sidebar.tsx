"use client"

import { useEffect, useState } from "react"

import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

import { AI_CATEGORIES } from "@/lib/constants"
import { api } from "@/lib/api"
import { Account } from "@/types"

interface SidebarProps {
  selectedAccount: string
  onSelectAccount: (account: string) => void
  selectedCategory?: string
  onSelectCategory?: (category: string | undefined) => void
}

export function Sidebar({
  selectedAccount,
  onSelectAccount,
  selectedCategory,
  onSelectCategory,
}: SidebarProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const accountsData = await api.accounts.getAll()
        setAccounts(accountsData || [])
      } catch (error) {
        console.error("Error fetching accounts:", error)
        setError("Failed to load accounts")
        setAccounts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen">
      <div className="border-b border-sidebar-border p-4">
        <h2 className="text-lg font-bold text-sidebar-foreground">ReachInbox</h2>
        <p className="text-xs text-sidebar-foreground/60 mt-1">AI Email Management</p>
      </div>

      <div className="border-b border-sidebar-border p-4">
        <p className="mb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
          Accounts
        </p>
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-3 text-xs text-red-400 bg-red-500/10 rounded-md">{error}</div>
          ) : (
            <>
              <button
                onClick={() => onSelectAccount("all")}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  selectedAccount === "all"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                All Accounts
              </button>

              {accounts && accounts.length > 0 ? (
                accounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => onSelectAccount(account.email)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors truncate",
                      selectedAccount === account.email
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                    title={account.email}
                  >
                    {account.email}
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-muted-foreground">No accounts configured</div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
          Categories
        </p>
        <div className="space-y-1">
          {AI_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory?.(category.value)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors flex items-center gap-2",
                  selectedCategory === category.value
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
