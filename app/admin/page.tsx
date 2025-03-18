import { AdminPanel } from "@/components/admin-panel"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"

export default async function AdminPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <AdminPanel />
    </main>
  )
}

