"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/services/api"
import { CreateBot } from "../components/CreateBot"

const CreatePersonaPage = () => {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        // Guard 1: only alumni can access bot creation
        const profile = await api.getCurrentUser()
        if (!profile || profile.role !== "alumni") {
          import("react-toastify").then(({ toast }) =>
            toast.info("Only mentors can create personas. Redirecting you to Explore!", { autoClose: 3000 })
          )
          router.replace("/explore")
          return
        }

        // Guard 2: already has a bot → redirect to edit it
        const data = await api.getBots()
        if (data && data.length >= 1) {
          import("react-toastify").then(({ toast }) =>
            toast.info("You can't create more bots. Either delete your existing bot or edit it.")
          )
          router.push(`/dashboard/${data[0].id}`)
          return
        }

        setChecking(false)
      } catch (err) {
        console.error("Failed to check permissions:", err)
        router.replace("/signin")
      }
    })()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-orange-500 font-semibold animate-pulse">Checking permissions...</p>
      </div>
    )
  }

  return (
    <div>
      <CreateBot />
    </div>
  )
}

export default CreatePersonaPage