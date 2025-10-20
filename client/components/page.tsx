"use client"

import { useState, useEffect } from "react"

import { Sidebar } from "@/components/sidebar"
import { EmailList } from "@/components/email-list"
import { EmailDetail } from "@/components/email-detail"
import { Header } from "@/components/header"
import { useEmailStore } from "@/hooks/use-email-store"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { transformBackendEmail } from "@/lib/utils-email"

export default function Home() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const { addNotification, setEmails, setLoading, setError } = useEmailStore()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true)
        setError(null)

        const params: Parameters<typeof api.emails.search>[0] = {
          page: 1,
          pageSize: 100,
        }

        if (selectedAccount !== "all") {
          params.account = selectedAccount
        }
        if (selectedCategory) {
          params.category = selectedCategory
        }
        if (searchQuery) {
          params.q = searchQuery
        }

        const response = await api.emails.search(params)

        const transformedEmails = (response?.data?.emails || []).map(transformBackendEmail)
        setEmails(transformedEmails)

        console.log(
          `Loaded ${transformedEmails.length} emails from backend (Total: ${response?.data?.pagination?.total || 0})`
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch emails"
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Error loading emails",
          description: errorMessage,
        })
        console.error("Error fetching emails:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [selectedAccount, selectedCategory, searchQuery, setEmails, setLoading, setError, toast])

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random()
      if (random > 0.7) {
        addNotification({
          type: "new_email",
          title: "New email from Sarah",
          message: "Q4 Planning Meeting",
        })
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [addNotification])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedAccount={selectedAccount}
        onSelectAccount={setSelectedAccount}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="flex flex-1 flex-col">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="flex flex-1 overflow-hidden">
          <EmailList
            selectedEmailId={selectedEmailId}
            onSelectEmail={setSelectedEmailId}
            searchQuery={searchQuery}
            selectedAccount={selectedAccount}
          />

          {selectedEmailId && <EmailDetail emailId={selectedEmailId} />}
        </div>
      </div>
    </div>
  )
}
