"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Briefcase, ChevronRight, Check, Camera, Upload, Trash2, Zap, AlertCircle, Sparkles } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { api } from "../../services/api"
import { useRouter } from "next/navigation"
import { useToast } from "../../hooks/useToast"
import { Loader } from "../../components/ui/Loader"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<"user" | "alumni" | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const handleRoleSelection = (selectedRole: "user" | "alumni") => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("Image size must be less than 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleComplete = async () => {
    if (!role || !displayName) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // 1. Update Profile (display_name, role)
      await api.updateProfile({
        display_name: displayName,
        role: role,
        onboarding_completed: true
      })

      // 2. Upload Avatar if present (convert base64 to File)
      if (avatar && avatar.startsWith("data:")) {
        const response = await fetch(avatar)
        const blob = await response.blob()
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
        await api.uploadAvatar(file)
      }

      showSuccess("Welcome to PersonaBot!")

      // 3. Redirect Based on Role
      if (role === "user") {
        router.push("/explore")
      } else if (role === "alumni") {
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Onboarding failed:", err)
      setError(err.message || "Failed to complete onboarding. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full bg-orange-50/30" />
      <div className="fixed -z-10 -top-40 -right-40 w-[600px] h-[600px] bg-orange-100/40 blur-[150px] rounded-full" />
      <div className="fixed -z-10 -bottom-40 -left-40 w-[600px] h-[600px] bg-pink-100/40 blur-[150px] rounded-full" />

      <div className="max-w-4xl w-full relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-center gap-3 mb-16">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-16 rounded-full transition-all duration-700",
                step >= i ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100 mb-8">
                <Sparkles size={16} className="text-orange-500" />
                <span className="text-sm font-bold text-gray-700 uppercase tracking-widest">Get Started</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Choose your path
              </h1>
              <p className="text-gray-500 text-xl mb-16 max-w-xl mx-auto leading-relaxed font-medium">
                Connect with the world's leading minds or scale your own wisdom through AI.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {/* User Role */}
                <button
                  onClick={() => handleRoleSelection("user")}
                  className="group relative p-10 rounded-[3rem] bg-white border-2 border-gray-100 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/10 transition-all text-left overflow-hidden active:scale-[0.98]"
                >
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                      <User size={32} />
                    </div>
                    <h3 className="text-2xl font-black mb-3 tracking-tight text-gray-900">Explorer</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      Interact with elite AI personas and gain insights from industry leaders.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={28} className="text-orange-300" />
                  </div>
                </button>

                {/* Alumni/Pro Role */}
                <button
                  onClick={() => handleRoleSelection("alumni")}
                  className="group relative p-10 rounded-[3rem] bg-white border-2 border-gray-100 hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-500/10 transition-all text-left overflow-hidden active:scale-[0.98]"
                >
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-8 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
                      <Briefcase size={32} />
                    </div>
                    <h3 className="text-2xl font-black mb-3 tracking-tight text-gray-900">Creator</h3>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                      Build your AI persona. Share your knowledge and scale your impact globally.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={28} className="text-pink-300" />
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md mx-auto text-center"
            >
              <div className="relative w-40 h-40 mx-auto mb-12 group">
                <div className="w-full h-full rounded-[3.5rem] bg-white border-4 border-gray-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-orange-200 shadow-2xl shadow-gray-200">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-300" />
                  )}
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-white text-gray-900 rounded-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-90 border-2 border-gray-50"
                >
                  <Camera size={20} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                />
              </div>

              <h2 className="text-4xl font-black mb-4 tracking-tight text-gray-900">Final touches</h2>
              <p className="text-gray-500 text-xl mb-12 font-medium">How should we address you?</p>

              <div className="space-y-6 mb-12">
                <input
                  type="text"
                  placeholder="Your display name"
                  className="w-full h-18 bg-white border-2 border-gray-100 rounded-[2rem] px-8 text-2xl outline-none focus:border-orange-400 transition-all text-center font-bold shadow-sm placeholder:text-gray-300"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              {error && (
                <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-[2rem] flex items-center gap-4 animate-shake">
                    <AlertCircle size={24} />
                    <p className="text-sm font-bold">{error}</p>
                </div>
              )}

              <button
                onClick={handleComplete}
                disabled={isSubmitting || !displayName}
                className="w-full h-18 bg-gray-900 text-white font-black text-xl rounded-[2rem] flex items-center justify-center gap-4 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 shadow-xl shadow-gray-200"
              >
                {isSubmitting ? (
                  <Loader size="28" color="white" />
                ) : (
                  <>
                    Finish Setup <ChevronRight size={24} />
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setStep(1)}
                className="mt-10 text-gray-400 hover:text-orange-500 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                Change Role
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-10 left-10 flex items-center gap-2 opacity-30">
        <img src="/logo.png" alt="Logo" className="w-5 h-5 grayscale object-contain" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">PersonaBot Alpha</span>
      </div>
    </div>
  )
}
