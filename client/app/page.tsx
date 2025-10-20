import { Suspense } from "react"
import Home from "@/components/page"

export default function Page() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}
    >
      <Home />
    </Suspense>
  )
}
