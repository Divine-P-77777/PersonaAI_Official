"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Plus, ArrowUpRight, Search, Zap, Clock, User, LogOut, LayoutDashboard, Settings, MessageSquare } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "@/services/api"
import { useToast } from "@/hooks/useToast"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function DashboardPage() {
  const [bots, setBots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchBots()
  }, [])

  const fetchBots = async () => {
    try {
      setLoading(true)
      const data = await api.getBots()
      setBots(data)
    } catch (err: any) {
      console.error("Failed to fetch bots:", err)
      showError("Could not load your personas.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-gray-900 font-sans selection:bg-orange-200">
      {/* Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Zap className="text-white fill-white" size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              PersonaBot
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
               onClick={handleSignOut}
               className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
               title="Sign Out"
            >
              <LogOut size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 ring-orange-200 transition-all">
                <User size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-28 pb-12 px-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
              My <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Personas</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium">Manage and scale your industry knowledge with AI.</p>
          </div>
          <Link
            href="/dashboard/create"
            className="h-14 px-8 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={20} /> New Persona
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 group max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search your personas by name or expertise..."
            className="w-full h-15 bg-white border-2 border-orange-50 rounded-3xl pl-14 pr-6 text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-orange-200 focus:ring-4 focus:ring-orange-50 shadow-sm transition-all"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-[40px] bg-white border-2 border-orange-50 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-orange-100">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-400">
              <Bot size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No personas yet</h3>
            <p className="text-gray-500 mb-8">Create your first AI persona to start sharing your expertise.</p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-8 py-3 bg-orange-50 text-orange-600 font-bold rounded-2xl hover:bg-orange-100 transition-colors"
            >
              <Plus size={20} /> Create Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bots.map((bot) => (
              <Link
                href={`/dashboard/${bot.id}`}
                key={bot.id}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group p-8 rounded-[40px] bg-white border-2 border-orange-50 hover:border-orange-200 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-100/50"
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
                      bot.status === "ready" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", bot.status === "ready" ? "bg-green-500" : "bg-orange-500 animate-pulse")} />
                      {bot.status === "ready" ? "Online" : "Training"}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center text-orange-600 group-hover:from-orange-400 group-hover:to-pink-500 group-hover:text-white shadow-inner transition-all duration-300">
                      {bot.avatar_url ? (
                        <img src={bot.avatar_url} alt={bot.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Bot size={32} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(bot.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-500 text-base mb-8 line-clamp-2 leading-relaxed font-medium">
                    {bot.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-orange-50">
                    <div className="flex gap-2">
                       <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors">
                          <MessageSquare size={16} />
                       </span>
                       <span className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors">
                          <LayoutDashboard size={16} />
                       </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-transparent flex items-center justify-center text-gray-400 group-hover:bg-gradient-to-br from-orange-400 to-pink-500 group-hover:text-white group-hover:border-white transition-all duration-300 shadow-sm group-hover:shadow-lg">
                      <ArrowUpRight size={22} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
