import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Briefcase, GraduationCap, Link as LinkIcon, Globe, Star, Users } from "lucide-react"
import { Bot } from "../../types"
import { BotAvatar } from "../../app/explore/components/BotAvatar"

interface ProfileModalProps {
  bot: Bot | null
  onClose: () => void
}

export function ProfileModal({ bot, onClose }: ProfileModalProps) {
  useEffect(() => {
    if (bot) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [bot]);

  if (!bot) return null

  const { persona_config } = bot


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >

          <div className="absolute top-4 right-4 z-[60]">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto w-full h-full pb-8 overscroll-contain" data-lenis-prevent="true">
            {/* Header Cover */}
            <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-500 relative shrink-0">
            </div>

            <div className="px-8">
              {/* Avatar & Name */}
              <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden">
                  <BotAvatar bot={bot} className="w-full h-full" />
                </div>
                <div className="text-center sm:text-left mb-2">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{bot.name}</h2>
                </div>
              </div>

              {/* Main Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column - Info */}
                <div className="md:col-span-2 space-y-8">

                  {/* About */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                      About
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {bot.description || `Specialized AI mentor focused on ${bot.persona_config.expertise?.join(', ')}.`}
                    </p>
                  </div>

                  {/* Experience */}
                  {persona_config.experience && persona_config.experience.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Briefcase size={16} className="text-orange-500" /> Experience
                      </h3>
                      <div className="space-y-4">
                        {persona_config.experience.map((exp, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                              <Briefcase size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{exp.title}</h4>
                              <p className="text-sm text-gray-500">{exp.company} • {exp.years} years</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {persona_config.education && persona_config.education.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <GraduationCap size={16} className="text-pink-500" /> Education
                      </h3>
                      <div className="space-y-4">
                        {persona_config.education.map((edu, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                              <p className="text-sm text-gray-500">{edu.institute} • {edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Stats & Links */}
                <div className="space-y-6">

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sessions</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Users size={16} className="text-gray-900" />
                        <span className="text-lg font-black text-gray-900">
                          {bot.session_count || "12.4k"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rating</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={16} className="text-orange-500 fill-orange-500" />
                        <span className="text-lg font-black text-gray-900">4.9</span>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  {persona_config.links && Object.keys(persona_config.links).length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Links</h3>
                      <div className="flex flex-col gap-2">
                        {Object.entries(persona_config.links).map(([key, url]) => {
                          if (!url) return null;
                          let Icon = LinkIcon;
                          let color = "text-gray-500 group-hover:text-gray-900";
                          if (key.toLowerCase() === 'linkedin') { color = "text-blue-500 group-hover:text-blue-600"; }
                          if (key.toLowerCase() === 'github') { color = "text-gray-900"; }
                          if (key.toLowerCase() === 'portfolio' || key.toLowerCase() === 'website') { Icon = Globe; color = "text-purple-500 group-hover:text-purple-600"; }

                          return (
                            <a
                              key={key}
                              href={url.startsWith('http') ? url : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={18} className={color} />
                                <span className="text-sm font-semibold text-gray-700 capitalize">{key}</span>
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Expertise */}
                  {persona_config.expertise && persona_config.expertise.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {persona_config.expertise.map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg max-w-full truncate">
                            {skill.length > 35 ? skill.slice(0, 35) + '...' : skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
