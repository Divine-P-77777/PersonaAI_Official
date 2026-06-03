"use client"

import { useCallback, useEffect, useRef, useState } from "react"


type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;

export interface UseAudioCaptureReturn {
  isListening: boolean
  isMicAllowed: boolean | null
  micError: string | null
  startListening: () => void
  stopListening: () => void
  toggleMic: () => void
}

export function useAudioCapture(
  isConnected: boolean,
  language: string,
  onTranscript: (text: string) => void,
): UseAudioCaptureReturn {
  const [isListening, setIsListening] = useState(false)
  const [isMicAllowed, setIsMicAllowed] = useState<boolean | null>(null)
  const [micError, setMicError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const deepgramWsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const activeStreamRef = useRef<MediaStream | null>(null)

  const isMountedRef = useRef(true)

  // Stable mutable refs to prevent stale closure captures in events
  const isListeningRef = useRef(isListening)
  const onTranscriptRef = useRef(onTranscript)
  const languageRef = useRef(language)

  // Keep refs synchronized
  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    languageRef.current = language
    // Update language on the native recognition instance if it's currently running
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US"
    }
    // Deepgram language switch requires reconnecting. For simplicity, we keep current connection 
    // and rely on user stopping/starting if they switch languages, or native fallback handles it.
  }, [language])

  const stopAll = useCallback(() => {
    // Stop Deepgram & MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (deepgramWsRef.current) {
      deepgramWsRef.current.onclose = null // Prevent fallback trigger
      deepgramWsRef.current.onerror = null
      deepgramWsRef.current.close()
      deepgramWsRef.current = null
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop())
      activeStreamRef.current = null
    }
    // Stop Native Recognition
    if (recognitionRef.current) {
      recognitionRef.current.onend = null // Prevent auto-restart
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    setIsListening(false)
    isListeningRef.current = false
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopAll()
    }
  }, [stopAll])


  // ── Native Browser STT (Fallback) ────────────────────────────────────────────────
  const buildRecognition = useCallback((): SpeechRecognition | null => {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRec) {
      setMicError("Your browser does not support speech recognition. Try Chrome or Edge.")
      return null
    }

    const rec: SpeechRecognition = new SpeechRec()
    rec.lang = languageRef.current === "hi" ? "hi-IN" : "en-US"
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          if (text && isMountedRef.current) {
            onTranscriptRef.current(text)
          }
        }
      }
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (!isMountedRef.current) return
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setIsMicAllowed(false)
        setMicError("Microphone access denied. Please allow mic access in your browser.")
        stopAll()
      } else if (event.error !== "aborted") {
        console.warn("[AudioCapture] Native SpeechRecognition error:", event.error)
      }
    }

    rec.onend = () => {
      if (!isMountedRef.current) return
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current && recognitionRef.current === rec) {
        setTimeout(() => {
          if (isMountedRef.current && isListeningRef.current && recognitionRef.current === rec) {
            try { rec.start() } catch (err) {
              console.warn("[AudioCapture] Failed to restart Native SpeechRecognition:", err);
            }
          }
        }, 150)
      }
    }

    return rec
  }, [stopAll])

  const startNativeRecognition = useCallback(() => {
    const rec = buildRecognition()
    if (!rec) return

    recognitionRef.current = rec
    try {
      rec.start()
      setIsListening(true)
      isListeningRef.current = true
      console.log("[AudioCapture] Started Native SpeechRecognition")
    } catch (e) {
      console.error("[AudioCapture] Failed to start native recognition:", e)
      stopAll()
    }
  }, [buildRecognition, stopAll])

  const fallbackToNative = useCallback(() => {
    console.warn("[AudioCapture] Falling back to Native SpeechRecognition...")
    // Cleanup deepgram streams so native can use mic
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop())
      activeStreamRef.current = null
    }
    
    startNativeRecognition()
  }, [startNativeRecognition])


  // ── Start Listening ────────────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (!isConnected) {
      setMicError("WebSocket not connected yet. Please wait.")
      return
    }

    stopAll()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsMicAllowed(true)
      setMicError(null)

      const dgKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
      
      // If no key provided, default directly to Native STT
      if (!dgKey || dgKey === "") {
        console.log("[AudioCapture] No Deepgram API key found. Defaulting to Native STT.")
        stream.getTracks().forEach(track => track.stop()) // release mic for native API
        startNativeRecognition()
        return
      }

      // Start Deepgram STT
      activeStreamRef.current = stream
      const langCode = languageRef.current === "hi" ? "hi" : "en"
      const wsUrl = `wss://api.deepgram.com/v1/listen?language=${langCode}&model=nova-2&smart_format=true`
      
      const ws = new WebSocket(wsUrl, ["token", dgKey])
      deepgramWsRef.current = ws

      ws.onopen = () => {
        console.log("[AudioCapture] Deepgram WebSocket connected")
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data)
          }
        })

        mediaRecorder.start(250) // send audio chunks every 250ms
        setIsListening(true)
        isListeningRef.current = true
      }

      ws.onmessage = (message) => {
        try {
          const received = JSON.parse(message.data)
          const transcript = received.channel?.alternatives[0]?.transcript
          
          if (transcript && received.is_final) {
            if (isMountedRef.current) {
              onTranscriptRef.current(transcript)
            }
          }
        } catch (e) {
          console.warn("[AudioCapture] Failed to parse deepgram message", e)
        }
      }

      ws.onerror = (e) => {
        console.warn("[AudioCapture] Deepgram error encountered. Falling back.", e)
        if (isListeningRef.current && deepgramWsRef.current === ws) {
           fallbackToNative()
        }
      }

      ws.onclose = (e) => {
        // If closed abnormally and we are still supposed to be listening
        if (e.code !== 1000 && e.code !== 1005 && isListeningRef.current && deepgramWsRef.current === ws) {
          console.warn(`[AudioCapture] Deepgram closed unexpectedly (code: ${e.code}). Falling back.`)
          fallbackToNative()
        }
      }

    } catch (err) {
      console.error("[AudioCapture] Mic access error", err)
      setIsMicAllowed(false)
      setMicError("Microphone access denied.")
      return
    }
  }, [isConnected, stopAll, startNativeRecognition, fallbackToNative])

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopAll()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopAll])

  return { isListening, isMicAllowed, micError, startListening, stopListening: stopAll, toggleMic }
}
