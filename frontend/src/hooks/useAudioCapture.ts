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
  const isMountedRef = useRef(true)

  // Stable mutable refs to prevent stale closure captures in browser STT events
  const isListeningRef = useRef(isListening)
  const onTranscriptRef = useRef(onTranscript)

  // Keep refs synchronized on every render
  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      recognitionRef.current?.stop()
    }
  }, [])

  // Update language on the recognition instance when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-US"
    }
  }, [language])

  const buildRecognition = useCallback((): SpeechRecognition | null => {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRec) {
      setMicError("Your browser does not support speech recognition. Try Chrome or Edge.")
      return null
    }

    const rec: SpeechRecognition = new SpeechRec()
    rec.lang = language === "hi" ? "hi-IN" : "en-US"
    rec.continuous = true    // Keep listening between pauses
    rec.interimResults = true    // Show live partial transcripts

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
        setIsListening(false)
        isListeningRef.current = false
      } else if (event.error !== "aborted") {
        console.warn("[AudioCapture] SpeechRecognition error:", event.error)
      }
    }

    rec.onend = () => {
      if (!isMountedRef.current) return
      // Auto-restart if we're still supposed to be listening (continuous mode)
      if (isListeningRef.current && recognitionRef.current === rec) {
        setTimeout(() => {
          if (isMountedRef.current && isListeningRef.current && recognitionRef.current === rec) {
            try { rec.start() } catch (err) {
              console.warn("[AudioCapture] Failed to restart SpeechRecognition:", err);
            }
          }
        }, 150)
      }
    }

    return rec
  }, [language])
  const startListening = useCallback(async () => {
    if (!isConnected) {
      setMicError("WebSocket not connected yet. Please wait.")
      return
    }

    // Request mic permission explicitly first for a clear browser prompt
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop all tracks immediately so the microphone device is released for SpeechRecognition
      stream.getTracks().forEach(track => track.stop())
      setIsMicAllowed(true)
      setMicError(null)
    } catch (err) {
      setIsMicAllowed(false)
      setMicError("Microphone access denied.")
      return
    }

    const rec = buildRecognition()
    if (!rec) return

    recognitionRef.current = rec
    try {
      rec.start()
      setIsListening(true)
      isListeningRef.current = true
    } catch (e) {
      console.error("[AudioCapture] Failed to start recognition:", e)
    }
  }, [isConnected, buildRecognition])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    isListeningRef.current = false
  }, [])

  const toggleMic = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return { isListening, isMicAllowed, micError, startListening, stopListening, toggleMic }
}
