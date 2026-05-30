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

  return (
    <div className="w-full max-w-md bg-gray-900/40 backdrop-blur-md border border-white/5 rounded-2xl px-5 py-3 flex flex-col justify-between shadow-2xl">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 select-none">
        Live Transcript
      </div>
      <div
        className="h-[60px] overflow-y-auto flex flex-col gap-2 no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        aria-live="polite"
        aria-label="Conversation transcript"
      >
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {entries.length === 0 ? (
          <div className="text-gray-500 text-sm italic h-full flex items-center">
            Start speaking to begin the conversation…
          </div>
        ) : (
          <>
            {entries.map((entry, i) => (
              <div key={i} className="text-sm leading-normal flex items-start gap-2">
                <span className={`font-bold shrink-0 ${entry.role === "user" ? "text-orange-400" : "text-teal-400"}`}>
                  {entry.role === "user" ? "You:" : "Mentor:"}
                </span>
                <span className={`text-gray-300 ${entry.partial ? "opacity-75 italic" : ""}`}>
                  {entry.text}
                  {entry.partial && (
                    <span className="ml-1 inline-flex gap-0.5 align-middle">
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  )
}
