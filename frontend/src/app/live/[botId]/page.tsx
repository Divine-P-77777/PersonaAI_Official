"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { api } from "@/services/api"
import { Bot } from "@/types"
import { useLiveSession, Language, ServerMessage } from "@/hooks/useLiveSession"
import { useAudioCapture } from "@/hooks/useAudioCapture"
import { Mic, MicOff, Volume2, MessageSquare, MessageSquareOff, FileUp } from "lucide-react"
import LanguageToggle from "@/components/live/LanguageToggle"
import LiveControls from "@/components/live/LiveControls"
import TranscriptPanel, { TranscriptEntry } from "@/components/live/TranscriptPanel"
import { CreditWarningPopup } from "@/components/ui/CreditWarningPopup"
import { toast } from "react-toastify"

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
  const [warningPopup, setWarningPopup] = useState<{ isOpen: boolean; mode: 'warning' | 'blocked'; message?: string }>({ isOpen: false, mode: 'warning' })
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null)

  // ── Live state ─────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<Language>("en")
  const [autoSwitched, setAutoSwitched] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [showTranscript, setShowTranscript] = useState(true)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastAiTextRef = useRef<string>("")
  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  // ── MediaSource Streaming Refs ─────────────────────────────────────────────
  const mediaSourceRef = useRef<MediaSource | null>(null)
  const sourceBufferRef = useRef<SourceBuffer | null>(null)
  const chunkQueueRef = useRef<ArrayBuffer[]>([])
  const isAppendingRef = useRef(false)
  const isDoneReceivingRef = useRef(false)
  const fallbackAudioChunksRef = useRef<string[]>([]) // Used solely to detect if TTS failed
  const mediaSourceUrlRef = useRef<string | null>(null) // Track object URL for cleanup

  // ── Fetch bot + start session ──────────────────────────────────────────────
  useEffect(() => {
    if (!botId) return
      ; (async () => {
        try {
          const data = await api.getBot(botId)
          setBot(data)

          try {
            const access = await api.getBotAccess(botId)
            if (access.credits_remaining !== undefined) {
              setCreditsRemaining(access.credits_remaining)
            }
          } catch (e) {
            console.error("Failed to fetch access", e)
          }

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

  // ── MediaSource Queue Processor ────────────────────────────────────────────────
  const processAudioQueue = useCallback(() => {
    if (!sourceBufferRef.current || isAppendingRef.current) return
    if (chunkQueueRef.current.length === 0) {
      if (isDoneReceivingRef.current && mediaSourceRef.current?.readyState === "open") {
        try { mediaSourceRef.current.endOfStream() } catch (e) { console.warn("Failed to end stream", e) }
        isDoneReceivingRef.current = false
      }
      return
    }

    try {
      isAppendingRef.current = true
      const chunk = chunkQueueRef.current.shift()!
      sourceBufferRef.current.appendBuffer(chunk)
    } catch (e) {
      console.warn("[MediaSource] Failed to append buffer:", e)
      isAppendingRef.current = false
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
          lastAiTextRef.current = msg.text
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
          fallbackAudioChunksRef.current.push(msg.data)

          // Decode base64 → binary bytes for MediaSource
          const binary = atob(msg.data)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }

          if (!mediaSourceRef.current) {
            // ── First chunk: bootstrap the MediaSource pipeline ──
            const ms = new MediaSource()
            mediaSourceRef.current = ms

            const objectUrl = URL.createObjectURL(ms)
            mediaSourceUrlRef.current = objectUrl     // save for cleanup

            const audio = new Audio(objectUrl)
            activeAudioRef.current = audio

            // Play immediately — browser buffers internally until first appendBuffer
            audio.play().catch(e => console.warn("[MediaSource] Auto-play prevented:", e))

            audio.onended = () => {
              setIsAISpeaking(false)
              // Revoke object URL now that playback is done (fixes memory leak)
              if (mediaSourceUrlRef.current) {
                URL.revokeObjectURL(mediaSourceUrlRef.current)
                mediaSourceUrlRef.current = null
              }
              mediaSourceRef.current = null
              sourceBufferRef.current = null
            }
            audio.onerror = () => setIsAISpeaking(false)

            ms.addEventListener("sourceopen", () => {
              try {
                const mimeType = msg.format === "wav" ? "audio/wav" : "audio/mpeg"
                const sb = ms.addSourceBuffer(mimeType)
                sourceBufferRef.current = sb

                // Drain queue whenever a buffer append completes
                sb.addEventListener("updateend", () => {
                  isAppendingRef.current = false
                  processAudioQueue()
                })

                // Push the first chunk (already decoded above) and start draining
                chunkQueueRef.current.push(bytes.buffer)
                processAudioQueue()
              } catch (e) {
                console.warn("[MediaSource] Init failed:", e)
              }
            })
          } else {
            // ── Subsequent chunks: just queue and drain ──
            chunkQueueRef.current.push(bytes.buffer)
            processAudioQueue()
          }
        }
        break

      case "speaking_done":
        if (fallbackAudioChunksRef.current.length === 0 && lastAiTextRef.current) {
          // TTS Exhausted / Failed fallback to browser SpeechSynthesis
          console.warn("[LivePage] No audio chunks received. Falling back to browser TTS.");
          const utterance = new SpeechSynthesisUtterance(lastAiTextRef.current);
          const textToSpeak = lastAiTextRef.current;

          // Auto-detect Devanagari characters to force Hindi voice even if session state is English
          const hasDevanagari = /[\u0900-\u097F]/.test(textToSpeak);
          const langCode = (language === 'hi' || hasDevanagari) ? 'hi-IN' : 'en-US';
          utterance.lang = langCode;

          const targetGender = bot?.persona_config?.voice_gender ?? bot?.voice_gender ?? 'female';
          const voices = window.speechSynthesis.getVoices();

          const isHindi = langCode.startsWith('hi');
          const maleKeywords = isHindi ? ['madhur', 'hemant', 'rishi', 'male'] : ['male', 'guy', 'david', 'mark'];
          const femaleKeywords = isHindi ? ['swara', 'kalpana', 'lekha', 'female'] : ['female', 'girl', 'zira', 'samantha'];

          const langVoices = voices.filter(v => v.lang.startsWith(langCode.split('-')[0]));

          let matchingVoice = langVoices.find(v => {
            const name = v.name.toLowerCase();
            if (targetGender === 'male') {
              return maleKeywords.some(kw => name.includes(kw));
            } else {
              return femaleKeywords.some(kw => name.includes(kw));
            }
          });

          // Google's default Hindi voice usually sounds female. Fallback to it if specific gender matches fail.
          if (!matchingVoice && isHindi) {
            matchingVoice = langVoices.find(v => v.name.includes('Google') || v.name.includes('Android'));
          }

          utterance.voice = matchingVoice || langVoices[0] || null;

          setIsAISpeaking(true);
          utterance.onend = () => setIsAISpeaking(false);
          utterance.onerror = () => setIsAISpeaking(false);

          // If using English voice for Hindi text, it will sound terrible. The Devanagari check above fixes it.
          window.speechSynthesis.speak(utterance);
        } else {
          isDoneReceivingRef.current = true
          processAudioQueue()
        }
        fallbackAudioChunksRef.current = [] // reset for next turn

        // Decrement credits
        setCreditsRemaining(prev => {
          if (prev !== null) {
            const newCredits = prev - 5; // Voice session costs 5 credits
            if (newCredits > 0 && newCredits <= 5) {
              // Next session will use 5 credits, so this is the last interaction
              setWarningPopup({ isOpen: true, mode: 'warning' })
            }
            return newCredits;
          }
          return prev;
        })
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
        // Check if it's a credit error based on msg.code (if available) or message content
        if (msg.code === "INSUFFICIENT_CREDITS" || msg.code === "EXPLORATION_LIMIT_REACHED" || msg.code === "ACCESS_EXPIRED" || msg.code === "TRIAL_EXHAUSTED") {
          setWarningPopup({ isOpen: true, mode: 'blocked', message: msg.message })
          if (activeAudioRef.current) {
            activeAudioRef.current.pause()
            activeAudioRef.current = null
          }
          setIsAISpeaking(false)
        }
        break
    }
  }, [processAudioQueue])

  const { isConnected, sendText, sendInterrupt, sendConfig, endSession } =
    useLiveSession(sessionId, token, handleMessage)

  // Mic + STT via Web Speech API
  const { isListening, micError, toggleMic, startListening, stopListening } = useAudioCapture(
    isConnected,
    language,
    (text) => {
      // Correct common browser STT developer-domain mishearings
      const correctedText = postProcessTranscript(text)
      sendText(correctedText)
      setTranscript(prev => [...prev, { role: "user", text: correctedText }])
    },
  )

  // Auto-mute mic when AI is speaking to prevent echo loops on mobile devices
  const wasListeningRef = useRef(false)
  useEffect(() => {
    if (isAISpeaking) {
      if (isListening) {
        wasListeningRef.current = true
        stopListening()
      }
    } else {
      if (wasListeningRef.current) {
        wasListeningRef.current = false
        // Small delay to ensure speaker output has completely stopped
        setTimeout(() => {
          startListening()
        }, 400)
      }
    }
  }, [isAISpeaking, isListening, startListening, stopListening])

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
      // User is unmuting — stop any active AI audio and reset MediaSource
      if (activeAudioRef.current) {
        activeAudioRef.current.pause()
        activeAudioRef.current = null
      }
      if (mediaSourceUrlRef.current) {
        URL.revokeObjectURL(mediaSourceUrlRef.current)
        mediaSourceUrlRef.current = null
      }
      mediaSourceRef.current = null
      sourceBufferRef.current = null
      chunkQueueRef.current = []
      isAppendingRef.current = false
      isDoneReceivingRef.current = false
      setIsAISpeaking(false)
    }
    toggleMic()
  }

  const handleExit = () => {
    if (confirm("Exit live session?")) { endSession(); router.push("/explore") }
  }

  const handleLiveResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !bot) return
    e.target.value = ""

    const allowed = ["application/pdf", "image/png", "image/jpeg"]
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, PNG, or JPG files are supported.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum is 5MB.")
      return
    }

    setIsUploadingResume(true)
    toast.info("Uploading and analyzing your resume...")
    try {
      const result = await api.reviewResume(bot.id, file)
      toast.success("Resume reviewed successfully!")
      // Save to chat history so it appears in text chat later
      // Show a brief in-page confirmation — full review is in /chat
      setTranscript(prev => [
        ...prev,
        { role: "user", text: `Uploaded resume: ${file.name}` },
        { role: "ai", text: `✅ Resume reviewed! Open the Chat tab to read the full feedback from ${bot.name}.` },
      ])
    } catch (err: any) {
      toast.error(err?.message || "Resume review failed. Please try again.")
    } finally {
      setIsUploadingResume(false)
    }
  }

  const handleLanguageToggle = (lang: Language) => {
    setLanguage(lang)
    setAutoSwitched(false)
    if (bot) sendConfig(lang, bot.persona_config?.voice_gender ?? "female", botId)
  }

  if (loading) return <LoadingScreen />
  if (error || !bot) return <ErrorScreen error={error} />

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-between py-6 md:py-8 gap-4 md:gap-6 relative overflow-hidden">
      {/* Minimal Language Toggle at top left */}
      <div className="absolute top-6 left-6 z-50">
        <LanguageToggle
          language={language}
          onToggle={handleLanguageToggle}
          autoSwitched={autoSwitched}
        />
      </div>

      {/* Transcript Toggle Icon at top right */}
      <button
        onClick={() => setShowTranscript(prev => !prev)}
        title={showTranscript ? "Hide Transcript" : "Show Transcript"}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-gray-900/60 backdrop-blur-md border border-white/10 hover:bg-gray-800 text-gray-300 hover:text-white transition-all shadow-md cursor-pointer"
        aria-label={showTranscript ? "Hide Transcript" : "Show Transcript"}
      >
        {showTranscript ? (
          <MessageSquare className="w-5 h-5" />
        ) : (
          <MessageSquareOff className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Avatar + name */}
      <section className="flex flex-col items-center gap-3 mt-4">
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
          <div className="h-6 flex items-center justify-center mt-1.5">
            {isAISpeaking ? (
              <p className="text-teal-400 text-xs font-semibold animate-pulse flex items-center justify-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Speaking…
              </p>
            ) : isListening ? (
              <p className="text-green-400 text-xs font-semibold animate-pulse flex items-center justify-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Listening…
              </p>
            ) : (
              <p className="text-gray-500 text-xs font-semibold flex items-center justify-center gap-1.5">
                <MicOff className="w-3.5 h-3.5 text-gray-600" /> Muted
              </p>
            )}
          </div>
          {micError && (
            <p className="text-red-400 text-xs mt-1">{micError}</p>
          )}
        </div>
      </section>

      {/* Transcript */}
      {showTranscript ? (
        <TranscriptPanel entries={transcript} />
      ) : (
        <div className="flex-grow" />
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        {/* Resume upload — small pill above the main control bar */}
        <div className="flex items-center gap-2">
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleLiveResumeUpload}
          />
          <button
            onClick={() => resumeInputRef.current?.click()}
            disabled={isUploadingResume}
            title={isUploadingResume ? "Reviewing resume…" : "Upload resume for AI review"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 border border-white/10 text-gray-300 hover:bg-orange-600 hover:text-white hover:border-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-semibold tracking-wide shrink-0"
          >
            {isUploadingResume
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              : <FileUp className="w-3.5 h-3.5 shrink-0" />}
            <span>{isUploadingResume ? "Reviewing…" : "Resume Review"}</span>
          </button>
        </div>

        <LiveControls
          isMuted={!isListening}
          isAISpeaking={isAISpeaking}
          onToggleMic={handleToggleMic}
          onInterrupt={() => {
            if (activeAudioRef.current) {
              activeAudioRef.current.pause()
              activeAudioRef.current = null
            }
            // Bug fix: also revoke the object URL and reset isDoneReceivingRef
            if (mediaSourceUrlRef.current) {
              URL.revokeObjectURL(mediaSourceUrlRef.current)
              mediaSourceUrlRef.current = null
            }
            mediaSourceRef.current = null
            sourceBufferRef.current = null
            chunkQueueRef.current = []
            isAppendingRef.current = false
            isDoneReceivingRef.current = false  // reset so next turn doesn't premature-end
            setIsAISpeaking(false)
            sendInterrupt()
          }}
          onExit={handleExit}
        />
      </div>
      {/* Credit Warning Popup */}
      <CreditWarningPopup
        isOpen={warningPopup.isOpen}
        mode={warningPopup.mode}
        message={warningPopup.message}
        onClose={() => setWarningPopup(prev => ({ ...prev, isOpen: false }))}
        onUpgrade={() => router.push(`/billing`)}
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
