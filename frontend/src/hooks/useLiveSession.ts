"use client"
/**
 * useLiveSession — WebSocket connection hook for Live Interaction mode.
 *
 * Responsibility:
 *   - Open / close the WebSocket connection.
 *   - Send typed messages (config, user_text, interrupt, session_end).
 *   - Parse incoming server events and call typed callbacks.
 *

 */

import { useCallback, useEffect, useRef, useState } from "react"

export type Language = "en" | "hi"

// Incoming server event types
export type ServerMessage =
  | { type: "stt_transcript"; text?: string; is_final?: boolean }
  | { type: "ai_transcript"; text?: string; partial?: boolean }
  | { type: "audio_stream"; data?: string; format?: string }
  | { type: "speaking_done"; format?: string }
  | { type: "language_switch"; language: string }
  | { type: "error"; message: string; code?: string }

// ── Hook return type ──────────────────────────────────────────────────────────

export interface UseLiveSessionReturn {
  isConnected: boolean
  sendText: (text: string) => void
  sendInterrupt: () => void
  sendConfig: (lang: Language, gender: string, botId: string) => void
  endSession: () => void
}

// Hook 

export function useLiveSession(
  sessionId: string | null,
  token: string | null,
  onMessage: (msg: ServerMessage) => void,
): UseLiveSessionReturn {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage  // Keep ref fresh without re-subscribing

  // ── Connect ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !token) return

    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") ?? "localhost:8000"
    const wsUrl = `${protocol}://${host}/api/live/ws/${sessionId}?token=${token}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      console.log("[LiveWS] Connected:", sessionId.slice(0, 8))
    }

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data)
        onMessageRef.current(msg)
      } catch {
        console.warn("[LiveWS] Failed to parse message:", event.data)
      }
    }

    ws.onclose = (e) => {
      setIsConnected(false)
      console.log("[LiveWS] Disconnected:", e.code, e.reason)
    }

    ws.onerror = (e) => {
      console.error("[LiveWS] WebSocket error:", e)
    }

    return () => {
      ws.close(1000, "Component unmounted")
    }
  }, [sessionId, token])

  // ── Senders ────────────────────────────────────────────────────────────────

  const send = useCallback((payload: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const sendConfig = useCallback((lang: Language, gender: string, botId: string) => {
    send({ type: "config", language: lang, voice_gender: gender, bot_id: botId })
  }, [send])

  const sendText = useCallback((text: string) => {
    send({ type: "user_text", text })
  }, [send])

  const sendInterrupt = useCallback(() => {
    send({ type: "interrupt" })
  }, [send])

  const endSession = useCallback(() => {
    send({ type: "session_end" })
    wsRef.current?.close(1000, "Session ended by user")
  }, [send])

  return { isConnected, sendText, sendInterrupt, sendConfig, endSession }
}
