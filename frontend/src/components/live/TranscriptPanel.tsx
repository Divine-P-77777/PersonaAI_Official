"use client"
/**
 * TranscriptPanel — Scrolling conversation transcript for Live Mode.
 *
 * Shows alternating user / AI messages as they arrive.
 * AI messages stream in incrementally (partial tokens shown live).
 */

import { useEffect, useRef } from "react"

export interface TranscriptEntry {
  role:    "user" | "ai"
  text:    string
  partial?: boolean  // True while AI is still speaking (streaming)
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[]
}

export default function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm italic">
        Start speaking to begin the conversation…
      </div>
    )
  }

  return (
    <div
      className="w-full max-w-2xl max-h-64 overflow-y-auto flex flex-col gap-3 px-2"
      aria-live="polite"
      aria-label="Conversation transcript"
    >
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              entry.role === "user"
                ? "bg-orange-600 text-white rounded-br-sm"
                : `bg-gray-800/80 text-gray-100 rounded-bl-sm border border-white/10 ${
                    entry.partial ? "opacity-70 italic" : ""
                  }`
            }`}
          >
            {entry.text}
            {entry.partial && (
              <span className="ml-1 inline-flex gap-0.5 align-middle">
                <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
