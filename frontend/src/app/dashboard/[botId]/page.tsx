"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
   Bot,
   ArrowLeft,
   MessageSquare,
   Zap,
   Settings,
   BarChart3,
   Globe,
   ShieldCheck,
   ExternalLink,
   RefreshCw,
   FileText,
   ChevronRight,
   Trash2,
   Image as ImageIcon,
   Link as LinkIcon,
   Type
} from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/hooks/useToast"
import Link from "next/link"
import { Bot as BotType, DataSource } from "@/types"
import KnowledgeSourcesList from "../components/KnowledgeSourcesList"

export default function BotDetailPage({ params }: { params: Promise<{ botId: string }> }) {
   const { botId } = React.use(params)
   const [bot, setBot] = useState<BotType | null>(null)
   const [sources, setSources] = useState<DataSource[]>([])
   const [loading, setLoading] = useState(true)
   const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
   const { showError, showSuccess } = useToast()
   const router = useRouter()

   const handleToggleStatus = async () => {
      if (!bot || isUpdatingStatus) return;
      
      setIsUpdatingStatus(true);
      const newStatus = bot.status === "ready" ? "draft" : "ready";
      try {
         const updatedBot = await api.updateBot(bot.id, { status: newStatus });
         setBot(updatedBot);
         showSuccess(`Persona is now ${newStatus === "ready" ? "Live" : "Paused"}`);
      } catch (err: any) {
         showError(err.message || "Failed to update status.");
      } finally {
         setIsUpdatingStatus(false);
      }
   };

   const handleDeleteSource = async (sourceId: string) => {
      try {
         await api.deleteDataSource(sourceId);
         setSources(sources.filter(s => s.id !== sourceId));
         showSuccess("Knowledge source deleted securely.");
      } catch (err: any) {
         showError(err.message || "Failed to delete source.");
      }
   };

   useEffect(() => {
      if (botId) {
         fetchBot()
      }
   }, [botId])

   const fetchBot = async () => {
      try {
         setLoading(true)
         const [botData, sourcesData] = await Promise.all([
             api.getBot(botId as string),
             api.getBotDataSources(botId as string)
         ]);
         setBot(botData)
         setSources(sourcesData)
      } catch (err: any) {
         console.error("Failed to fetch bot:", err)
         showError("Could not load bot details.")
         router.push("/dashboard")
      } finally {
         setLoading(false)
      }
   }

   if (loading) {
      return (
         <div className="min-h-screen bg-orange-50/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
               <p className="text-orange-600 font-medium animate-pulse">Loading Persona...</p>
            </div>
         </div>
      )
   }

   if (!bot) return null

   return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-gray-900 font-sans pb-20">
         {/* Header */}
         <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Link
                     href="/dashboard"
                     className="p-2 hover:bg-orange-50 rounded-xl text-gray-500 hover:text-orange-600 transition-all"
                  >
                     <ArrowLeft size={20} />
                  </Link>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Bot size={22} />
                     </div>
                     <div>
                        <h1 className="font-bold text-gray-900 leading-tight">{bot.name}</h1>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Persona Management</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  {/* Live/Pause Toggle */}
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-orange-50">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${bot.status === 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
                        {bot.status === 'ready' ? 'Live' : 'Paused'}
                     </span>
                     <button 
                        onClick={handleToggleStatus}
                        className={`w-10 h-5 rounded-full p-1 transition-all duration-300 flex items-center ${bot.status === 'ready' ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}
                     >
                        <motion.div 
                           layout
                           className="w-3 h-3 bg-white rounded-full shadow-sm"
                        />
                     </button>
                  </div>

                  <div className="hidden md:flex items-center gap-3">
                     <button className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-orange-50 transition-all">
                        <Globe size={16} />
                        Public Page
                     </button>
                     <Link
                        href={`/dashboard/${bot.id}/test`}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all"
                     >
                        <MessageSquare size={16} />
                        Test Chat
                     </Link>
                  </div>
               </div>
            </div>
         </header>

         <main className="max-w-7xl mx-auto px-6 pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

               {/* Left Column - Profile & Info */}
               <div className="lg:col-span-1 space-y-8">
                  <section className="bg-white rounded-[40px] p-8 border border-orange-100 shadow-sm">
                     <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-100 to-pink-100 p-1 mb-6 shadow-xl relative group">
                           {bot.avatar_url ? (
                              <img src={bot.avatar_url} alt={bot.name} className="w-full h-full object-cover rounded-[22px]" />
                           ) : (
                              <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-orange-400">
                                 <Bot size={48} />
                              </div>
                           )}
                           <div className={`absolute -bottom-2 -right-2 w-10 h-10 border-4 border-white rounded-full flex items-center justify-center text-white ${bot.status === 'ready' ? 'bg-green-500' : 'bg-gray-400'}`} title={bot.status === 'ready' ? 'Active' : 'Paused'}>
                              <Zap size={16} fill="white" />
                           </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{bot.name}</h2>
                        <p className="text-gray-500 font-medium leading-relaxed mb-6 italic">
                           "{bot.description}"
                        </p>

                        <div className="w-full pt-6 border-t border-orange-50 grid grid-cols-2 gap-4">
                           <div className="text-center p-3 rounded-2xl bg-orange-50/50">
                              <div className="text-xl font-black text-orange-600">0</div>
                              <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold">Chats</div>
                           </div>
                           <div className="text-center p-3 rounded-2xl bg-pink-50/50">
                              <div className="text-xl font-black text-pink-600">{sources.length}</div>
                              <div className="text-[10px] uppercase tracking-widest text-pink-400 font-bold">Sources</div>
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="bg-white rounded-[32px] p-6 border border-orange-100 shadow-sm">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Persona Config</h3>
                     <div className="space-y-4">
                        <Link 
                           href={`/dashboard/${bot.id}/edit`}
                           className="flex items-center justify-between p-3 hover:bg-orange-50 rounded-2xl transition-colors group cursor-pointer"
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                                 <Settings size={18} />
                              </div>
                              <span className="font-bold text-gray-700">Settings</span>
                           </div>
                           <ChevronRight size={16} className="text-gray-300" />
                        </Link>
                        <div className="flex items-center justify-between p-3 hover:bg-pink-50 rounded-2xl transition-colors group cursor-pointer">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all">
                                 <RefreshCw size={18} />
                              </div>
                              <span className="font-bold text-gray-700">Retrain Model</span>
                           </div>
                           <ExternalLink size={16} className="text-gray-300" />
                        </div>
                     </div>
                  </section>
               </div>

               {/* Right Column - Status & Analytics */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white rounded-[32px] p-8 border-l-8 border-l-orange-400 border border-orange-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                              <ShieldCheck size={28} />
                           </div>
                           <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${bot.status === 'ready' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {bot.status === 'ready' ? 'Health: 100%' : 'Status: Paused'}
                           </span>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-1">Knowledge Guard</h4>
                        <p className="text-gray-500 text-sm font-medium">Your persona is synced with {sources.length} data sources and is ready for interaction.</p>
                     </div>

                     <div className="bg-white rounded-[32px] p-8 border-l-8 border-l-pink-400 border border-pink-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl">
                              <BarChart3 size={28} />
                           </div>
                           <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-xs font-black uppercase tracking-wider">No Data</span>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-1">Performance</h4>
                        <p className="text-gray-500 text-sm font-medium">Insights and student engagement metrics will appear once you share your bot.</p>
                     </div>
                  </div>

                  <section className="bg-white rounded-[40px] p-8 border border-orange-100 shadow-sm">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <h3 className="text-2xl font-black text-gray-900">Knowledge Sources</h3>
                           <p className="text-gray-500 font-medium">Data used to ground your AI's responses</p>
                        </div>
                        <Link
                           href={`/dashboard/${bot.id}/ingest`}
                           className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-inner"
                        >
                           <RefreshCw size={20} />
                        </Link>
                     </div>

                     <KnowledgeSourcesList 
                        sources={sources} 
                        botId={bot.id} 
                        onDeleteSource={handleDeleteSource} 
                     />
                  </section>
               </div>

            </div>
         </main>
      </div>
   )
}
