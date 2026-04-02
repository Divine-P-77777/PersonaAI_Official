"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Plus, ArrowUpRight, Search, Zap, Clock, User, LogOut, LayoutDashboard, Settings, MessageSquare, FileText } from "lucide-react"
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
              <div 
                key={i} 
                className="h-72 rounded-[40px] bg-white border-2 border-orange-50 shadow-sm relative overflow-hidden flex flex-col p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50/50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-3/4 bg-orange-50/50 rounded-lg animate-pulse" />
                    <div className="h-4 w-1/2 bg-orange-50/50 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-full bg-orange-50/30 rounded-lg animate-pulse" />
                  <div className="h-4 w-5/6 bg-orange-50/30 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-full bg-orange-50/20 rounded-xl animate-pulse mt-6" />
              </div>
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-orange-100 rounded-[40px] bg-gradient-to-br from-orange-50/30 to-pink-50/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-orange-100/20 pointer-events-none">
               <FileText size={120} />
            </div>
            
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-orange-100 flex items-center justify-center text-orange-400 mb-6 relative z-10">
               <Zap size={36} fill="currentColor" className="opacity-20 absolute" />
               <FileText size={32} className="relative z-10" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">Knowledge Gap detected</h4>
            <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8 leading-relaxed">Your persona is currently an empty shell. Feed it data to transform it into a specialized AI mentor.</p>
            <Link 
               href={`/dashboard/create`}
               className="px-10 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-100 uppercase tracking-widest text-xs"
            >
               + Create Persona
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
