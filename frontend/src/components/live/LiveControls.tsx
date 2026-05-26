"use client"
/**
 * LiveControls — Bottom control bar for Live Mode.
 *
 * Contains: Language toggle, Mic, Interrupt, Exit buttons.
 * All state changes are propagated up via callbacks — this is a pure display component.
 */

import { Mic, MicOff, Square, X } from "lucide-react"
import LanguageToggle from "./LanguageToggle"
import type { Language } from "@/hooks/useLiveSession"

interface LiveControlsProps {
  language:       Language
  isMuted:        boolean
  isAISpeaking:   boolean
  autoSwitched:   boolean
  onToggleLanguage: (lang: Language) => void
  onToggleMic:    () => void
  onInterrupt:    () => void
  onExit:         () => void
}

export default function LiveControls({
  language,
  isMuted,
  isAISpeaking,
  autoSwitched,
  onToggleLanguage,
  onToggleMic,
  onInterrupt,
  onExit,
}: LiveControlsProps) {
  return (
    <div className="flex items-center gap-4 bg-gray-900/90 backdrop-blur-md px-8 py-5 rounded-[2.5rem] shadow-2xl border border-white/10">

      {/* Language Toggle */}
      <LanguageToggle
        language={language}
        onToggle={onToggleLanguage}
        autoSwitched={autoSwitched}
      />

      {/* Divider */}
      <div className="w-px h-8 bg-white/10" />

      {/* Interrupt — only visible when AI is speaking */}
      {isAISpeaking && (
        <button
          id="interrupt-btn"
          onClick={onInterrupt}
          title="Interrupt AI"
          className="p-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 transition-all duration-200 shadow-lg animate-pulse"
          aria-label="Interrupt AI speech"
        >
          <Square className="w-5 h-5 text-white fill-white" />
        </button>
      )}

      {/* Mic toggle */}
      <button
        id="mic-toggle-btn"
        onClick={onToggleMic}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
          isMuted
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-700 hover:bg-orange-600"
        }`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted
          ? <MicOff className="w-5 h-5 text-white" />
          : <Mic    className="w-5 h-5 text-orange-300" />
        }
      </button>

      {/* Exit */}
      <button
        id="exit-session-btn"
        onClick={onExit}
        title="Exit live session"
        className="p-4 rounded-2xl bg-red-700 hover:bg-red-600 transition-all duration-200 shadow-lg"
        aria-label="Exit session"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}
