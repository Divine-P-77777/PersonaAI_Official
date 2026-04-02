"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Save, 
  ArrowLeft, 
  Settings, 
  Type, 
  MessageSquare, 
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/hooks/useToast"
import Link from "next/link"
import { Bot as BotType } from "@/types"

export default function BotEditPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = React.use(params)
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  
  const [bot, setBot] = useState<BotType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    greeting: "",
    tone: "",
    expertise: ""
  })

  useEffect(() => {
    if (botId) fetchBot()
  }, [botId])

  const fetchBot = async () => {
    try {
      setLoading(true)
      const data = await api.getBot(botId as string)
      setBot(data)
      setFormData({
        name: data.name,
        description: data.description || "",
        greeting: data.persona_config.greeting || "",
        tone: data.persona_config.tone || "",
        expertise: data.persona_config.expertise?.join(", ") || ""
      })
    } catch (err: any) {
      showError("Could not load bot details.")
      router.push(`/dashboard/${botId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bot) return

    setSaving(true)
    try {
      await api.updateBot(bot.id, {
        name: formData.name,
        description: formData.description,
        persona_config: {
          ...bot.persona_config,
          greeting: formData.greeting,
          tone: formData.tone,
          expertise: formData.expertise.split(",").map(s => s.trim()).filter(Boolean)
        }
      })
      showSuccess("Persona updated successfully!")
      router.push(`/dashboard/${bot.id}`)
    } catch (err: any) {
      showError(err.message || "Failed to update bot.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/50 rounded-full blur-[120px] animate-pulse" />

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative z-10 flex flex-col items-center"
        >
           <div className="relative w-24 h-24 mb-6">
              {/* Outer Spinning Ring */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-orange-400 border-r-pink-500 animate-spin" style={{ animationDuration: '3s' }} />

              {/* Inner Content */}
              <div className="absolute inset-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200">
                 <Settings className="w-10 h-10 text-white" />
              </div>

              {/* Pulse Effect */}
              <div className="absolute inset-0 bg-orange-400 rounded-3xl animate-ping opacity-20" />
           </div>

           <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Loading Editor...</h3>
              <div className="flex items-center justify-center gap-1">
                 <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                 <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                 <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
           </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/dashboard/${botId}`}
              className="p-2 hover:bg-orange-50 rounded-xl text-gray-400 hover:text-orange-600 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Settings size={22} />
               </div>
               <div>
                 <h1 className="font-bold text-gray-900 leading-tight">Edit Persona</h1>
                 <p className="text-xs text-orange-500 font-black uppercase tracking-widest">Configuration Suite</p>
               </div>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12">
        <form onSubmit={handleSave} className="space-y-10">
          
          {/* Base Identity */}
          <section className="bg-white rounded-[40px] p-10 border border-orange-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-orange-50 opacity-10 pointer-events-none">
                <Info size={120} />
             </div>
             
             <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Type size={18} />
                </div>
                Core Identity
             </h2>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Name</label>
                   <input 
                     type="text"
                     className="w-full h-14 px-6 bg-gray-50 border-2 border-orange-50 rounded-2xl outline-none focus:border-orange-200 focus:bg-white transition-all font-bold text-gray-800"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Description</label>
                   <textarea 
                     className="w-full h-32 px-6 py-4 bg-gray-50 border-2 border-orange-50 rounded-3xl outline-none focus:border-orange-200 focus:bg-white transition-all font-medium text-gray-700 resize-none"
                     placeholder="A brief tagline for your AI mentor..."
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                </div>
             </div>
          </section>

          {/* Personality & Tone */}
          <section className="bg-white rounded-[40px] p-10 border border-orange-100 shadow-sm">
             <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center">
                    <Sparkles size={18} />
                </div>
                AI Personality
             </h2>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Custom Greeting</label>
                   <input 
                     type="text"
                     className="w-full h-14 px-6 bg-gray-50 border-2 border-orange-50 rounded-2xl outline-none focus:border-orange-200 focus:bg-white transition-all font-bold text-gray-800"
                     placeholder="e.g. Hello, I am your specialized career advisor..."
                     value={formData.greeting}
                     onChange={e => setFormData({...formData, greeting: e.target.value})}
                   />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Tone of Voice</label>
                      <select 
                        className="w-full h-14 px-6 bg-gray-50 border-2 border-orange-50 rounded-2xl outline-none focus:border-orange-200 focus:bg-white transition-all font-bold text-gray-800 appearance-none"
                        value={formData.tone}
                        onChange={e => setFormData({...formData, tone: e.target.value})}
                      >
                         <option value="">Select a Tone...</option>
                         <option value="Professional">Professional</option>
                         <option value="Friendly">Friendly</option>
                         <option value="Direct">Direct</option>
                         <option value="Empathetic">Empathetic</option>
                         <option value="Witty">Witty</option>
                      </select>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-4">Focus Areas (CSV)</label>
                      <input 
                        type="text"
                        className="w-full h-14 px-6 bg-gray-50 border-2 border-orange-50 rounded-2xl outline-none focus:border-orange-200 focus:bg-white transition-all font-bold text-gray-800"
                        placeholder="Python, React, UI/UX..."
                        value={formData.expertise}
                        onChange={e => setFormData({...formData, expertise: e.target.value})}
                      />
                   </div>
                </div>
             </div>
          </section>

          <div className="flex items-center justify-center gap-6 text-[11px] text-gray-400 font-bold uppercase tracking-widest pt-4">
             <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-500" /> AES-256 Encrypted
             </span>
             <span className="flex items-center gap-2">
                <Zap size={14} className="text-orange-400" /> Instant Propagation
             </span>
          </div>

        </form>
      </main>
    </div>
  )
}
