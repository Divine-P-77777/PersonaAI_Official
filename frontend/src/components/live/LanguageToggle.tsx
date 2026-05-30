"use client"
/**
 * LanguageToggle — Minimal EN | HI language switch pill.
 *
 * Sits in the Live Mode UI control bar. Two behaviours:
 *   1. Manual: User clicks to force switch language.
 *   2. Automatic: Parent passes `language` from server `language_switch` events.
 *
 * Shows a subtle auto-switch indicator when the server changed the language
 * (so the user knows why the response came in Hindi without clicking anything).
 */

import { useEffect, useRef, useState } from "react"
import type { Language } from "@/hooks/useLiveSession"

interface LanguageToggleProps {
  language:        Language
  onToggle:        (lang: Language) => void
  autoSwitched?:   boolean  // True when server auto-detected language change
}

export default function LanguageToggle({
  language,
  onToggle,
  autoSwitched = false,
}: LanguageToggleProps) {
  const [showAutoHint, setShowAutoHint] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Show a brief "auto" badge when server auto-switched the language
  useEffect(() => {
    if (autoSwitched) {
      setShowAutoHint(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setShowAutoHint(false), 2500)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [autoSwitched, language])

  const isHindi = language === "hi"

  return (
    <div className="relative flex items-center" title={`Language: ${language.toUpperCase()} — click to switch`}>
      {/* Auto-switch hint */}
      {showAutoHint && (
        <span
          className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold
                     bg-orange-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap
                     animate-fade-in shadow-sm"
        >
          auto-detected
        </span>
      )}

      {/* Pill toggle */}
      <button
        id="language-toggle-btn"
        onClick={() => onToggle(isHindi ? "en" : "hi")}
        className={`
          flex items-center gap-0 rounded-full border-2 transition-all duration-300
          overflow-hidden shadow-md text-xs font-black tracking-widest
          ${isHindi
            ? "border-orange-500 bg-orange-500"
            : "border-gray-700 bg-gray-800"
          }
        `}
        aria-label={`Switch language to ${isHindi ? "English" : "Hindi"}`}
      >
        {/* EN option */}
        <span
          className={`px-3 py-2 transition-colors duration-300 ${
            !isHindi ? "text-white" : "text-gray-400"
          }`}
        >
          EN
        </span>

        {/* Divider */}
        <span className="w-px h-5 bg-gray-500/40" />

        {/* HI option */}
        <span
          className={`px-3 py-2 transition-colors duration-300 ${
            isHindi ? "text-white" : "text-gray-400"
          }`}
        >
          HI
        </span>
      </button>
    </div>
  )
}
