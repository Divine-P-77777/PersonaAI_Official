"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { api } from "@/services/api"
import { Bot } from "@/types"
import { useLiveSession, Language, ServerMessage } from "@/hooks/useLiveSession"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import LiveControls from "@/components/live/LiveControls"
import TranscriptPanel, { TranscriptEntry } from "@/components/live/TranscriptPanel"

export default function LivePage() {
  const params = useParams()
  const router = useRouter()
  const botId = params.botId as string

  // ── Bot data ───────────────────────────────────────────────────────────────
  const [bot, setBot] = useState<Bot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Session ────────────────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // ── Live state ─────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<Language>("en")
  const [autoSwitched, setAutoSwitched] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const audioChunksRef = useRef<string[]>([])
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  // ── Fetch bot + start session ──────────────────────────────────────────────
  useEffect(() => {
    if (!botId) return
      ; (async () => {
        try {
          const data = await api.getBot(botId)
          setBot(data)
          const sess = await api.startLiveSession(botId)
          setSessionId(sess.session_id)
          setToken(sess.token)
        } catch (err: any) {
          setError(err.message || "Failed to start live session")
        } finally {
          setLoading(false)
        }
      })()
  }, [botId])

  // ── Concatenate and play accumulated base64 audio chunks ───────────────────
  const playAccumulatedAudio = useCallback(async (format: string) => {
    try {
      if (audioChunksRef.current.length === 0) return

      // Convert all base64 chunks to Uint8Arrays
      const byteArrays = audioChunksRef.current.map(base64 => {
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        return bytes
      })

      // Clear the chunks ref immediately so we don't play them again
      audioChunksRef.current = []

      // Calculate total length and concatenate all byte arrays
      const totalLength = byteArrays.reduce((acc, val) => acc + val.length, 0)
      const mergedBytes = new Uint8Array(totalLength)
      let offset = 0
      for (const byteArray of byteArrays) {
        mergedBytes.set(byteArray, offset)
        offset += byteArray.length
      }

      // Create a Blob from the merged bytes
      const mimeType = format === "wav" ? "audio/wav" : "audio/mpeg"
      const blob = new Blob([mergedBytes.buffer], { type: mimeType })
      const blobUrl = URL.createObjectURL(blob)

      // Stop any currently playing audio before starting new one
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current = null
      }

      // Play the blob using HTML5 Audio element (highly compatible and glitch-free)
      const audio = new Audio(blobUrl)
      activeAudioRef.current = audio

      audio.onended = () => {
        setIsAISpeaking(false)
        URL.revokeObjectURL(blobUrl)
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null
        }
      }
      audio.onerror = (e) => {
        console.warn("[LivePage] Audio playback element error:", e)
        setIsAISpeaking(false)
        URL.revokeObjectURL(blobUrl)
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null
        }
      }

      await audio.play()
    } catch (e) {
      console.warn("[LivePage] Failed to play accumulated audio:", e)
      setIsAISpeaking(false)
    }
  }, [])

  // ── WebSocket message handler ───────────────────────────────────────────────
  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "stt_transcript":
        if (msg.is_final && msg.text) {
          setTranscript(prev => [...prev, { role: "user", text: msg.text! }])
        }
        break

      case "ai_transcript":
        if (msg.text) {
          setTranscript(prev => {
            const last = prev[prev.length - 1]
            if (last?.role === "ai" && last.partial) {
              return [...prev.slice(0, -1), { role: "ai", text: msg.text!, partial: false }]
            }
            return [...prev, { role: "ai", text: msg.text!, partial: false }]
          })
        }
        break

      case "audio_stream":
        setIsAISpeaking(true)
        if (msg.data) {
          audioChunksRef.current.push(msg.data)
        }
        break

      case "speaking_done":
        // Play the accumulated stream now that synthesis is finished
        playAccumulatedAudio(msg.format ?? "mp3")
        break

      case "language_switch":
        if (msg.language === "en" || msg.language === "hi") {
          setLanguage(msg.language)
          setAutoSwitched(true)
          setTimeout(() => setAutoSwitched(false), 3000)
        }
        break

      case "error":
        console.error("[Live] Server error:", msg.message)
        break
    }
  }, [playAccumulatedAudio])

  const { isConnected, sendText, sendInterrupt, sendConfig, endSession } =
    useLiveSession(sessionId, token, handleMessage)

  // Mic + STT via Web Speech API
  const { isListening, micError, toggleMic } = useAudioCapture(
    isConnected,
    language,
    (text) => {
      // Correct common browser STT developer-domain mishearings
      const correctedText = postProcessTranscript(text)
      sendText(correctedText)
      setTranscript(prev => [...prev, { role: "user", text: correctedText }])
    },
  )

  // Send config once connected
  useEffect(() => {
    if (isConnected && bot) {
      const gender = bot.persona_config?.voice_gender ?? bot.voice_gender ?? "female"
      sendConfig(language, gender, botId)
    }
  }, [isConnected])



  // Handlers
  const handleToggleMic = () => {
    if (!isListening) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current = null
      }
      setIsAISpeaking(false)
    }
    toggleMic()
  }

  const handleExit = () => {
    if (confirm("Exit live session?")) { endSession(); router.push("/explore") }
  }

  const handleLanguageToggle = (lang: Language) => {
    setLanguage(lang)
    setAutoSwitched(false)
    if (bot) sendConfig(lang, bot.persona_config?.voice_gender ?? "female", botId)
  }

  if (loading) return <LoadingScreen />
  if (error || !bot) return <ErrorScreen error={error} />

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-12 gap-8">
      {/* Avatar + name */}
      <section className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-2xl shadow-orange-900/40">
            <Image src={bot.avatar_url || "/logo.png"} width={160} height={160} alt={bot.name} className="object-cover" />
          </div>
          <span className="absolute bottom-1 right-1 flex items-center gap-1 bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Live
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white">{bot.name}</h1>
          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mt-1">
            {isConnected ? "Session Active" : "Connecting…"}
          </p>
          {isConnected && !isListening && !micError && (
            <p className="text-orange-300/80 text-[11px] font-medium mt-1 animate-bounce">
              👇 Click the red mic button below to start talking!
            </p>
          )}
          {isListening && (
            <p className="text-green-400 text-xs font-semibold mt-1 animate-pulse">🎙 Listening…</p>
          )}
          {micError && (
            <p className="text-red-400 text-xs mt-1">{micError}</p>
          )}
        </div>
      </section>

      {/* Transcript */}
      <TranscriptPanel entries={transcript} />

      {/* Controls */}
      <LiveControls
        language={language}
        isMuted={!isListening}
        isAISpeaking={isAISpeaking}
        autoSwitched={autoSwitched}
        onToggleLanguage={handleLanguageToggle}
        onToggleMic={handleToggleMic}
        onInterrupt={() => {
          if (activeAudioRef.current) {
            activeAudioRef.current.pause()
            activeAudioRef.current = null
          }
          setIsAISpeaking(false)
          sendInterrupt()
        }}
        onExit={handleExit}
      />
    </main>
  )
}

// ── Sub-screens ───────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
      <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-orange-400 font-semibold animate-pulse">Entering Persona Space…</p>
    </div>
  )
}

function ErrorScreen({ error }: { error: string | null }) {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="bg-gray-900 rounded-3xl border border-red-900/40 p-10 text-center max-w-md w-full">
        <p className="text-red-400 font-semibold mb-6">{error || "Bot not found."}</p>
        <button onClick={() => router.push("/explore")} className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 transition-all">
          Back to Explore
        </button>
      </div>
    </div>
  )
}

// ── Developer Domain Post-Processor (Corrects browser Web Speech API mishearings) ──
function postProcessTranscript(text: string): string {
  let processed = text;

  const corrections: { [key: string]: string } = {
    "super bass": "Supabase",
    "superbase": "Supabase",
    "super-bass": "Supabase",
    "next js": "Next.js",
    "nextjs": "Next.js",
    "next years": "Next.js",
    "groque": "Groq",
    "groq": "Groq",
    "grog": "Groq",
    "croc": "Groq",
    "nomic": "Nomic",
    "gnomic": "Nomic",
    "read is": "Redis",
    "red is": "Redis",
    "fast api": "FastAPI",
    "fast-api": "FastAPI",
    "pg vector": "pgvector",
    "pg-vector": "pgvector",
    "p g vector": "pgvector",
    "git hub": "GitHub",
    "get hub": "GitHub",
    "rabbit mq": "RabbitMQ",
    "rabbit em queue": "RabbitMQ",
  };

  for (const [misheard, corrected] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${misheard}\\b`, "gi");
    processed = processed.replace(regex, corrected);
  }

  return processed;
}
