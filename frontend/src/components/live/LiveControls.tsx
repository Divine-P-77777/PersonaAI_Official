"use client"
import { useState } from "react"
import { Mic, MicOff, Pause, X } from "lucide-react"

interface LiveControlsProps {
  isMuted: boolean
  isAISpeaking: boolean
  onToggleMic: () => void
  onInterrupt: () => void
  onExit: () => void
}

export default function LiveControls({
  isMuted,
  isAISpeaking,
  onToggleMic,
  onInterrupt,
  onExit,
}: LiveControlsProps) {
  const [hasBeenClicked, setHasBeenClicked] = useState(false)

  const handleMicClick = () => {
    setHasBeenClicked(true)
    onToggleMic()
  }

  return (
    <div className="flex items-center gap-6 bg-gray-900/90 backdrop-blur-md px-8 py-5 rounded-[2.5rem] shadow-2xl border border-white/10">

      {/* Pause button — always visible, disabled by default, enabled when Mentor is speaking */}
      <button
        id="interrupt-btn"
        onClick={onInterrupt}
        disabled={!isAISpeaking}
        title={isAISpeaking ? "Pause Mentor" : "Pause (available when Mentor speaks)"}
        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${isAISpeaking
          ? "bg-yellow-500 hover:bg-yellow-400 text-white animate-pulse cursor-pointer"
          : "bg-gray-800 text-gray-500 opacity-40 cursor-not-allowed border border-gray-700/50"
          }`}
        aria-label="Pause Mentor"
      >
        <Pause className="w-5 h-5 text-white" />
      </button>

      {/* Mic toggle */}
      <button
        id="mic-toggle-btn"
        onClick={handleMicClick}
        title={isMuted ? "Unmute microphone" : "Mute microphone"}
        className={`p-4 rounded-2xl transition-all duration-300 shadow-lg relative ${isMuted
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gray-700 hover:bg-orange-600"
          } ${isMuted && !hasBeenClicked
            ? "ring-4 ring-red-500/80 animate-pulse border-2 border-red-400"
            : ""
          }`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted
          ? <MicOff className="w-5 h-5 text-white" />
          : <Mic className="w-5 h-5 text-orange-400" />
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
