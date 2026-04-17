"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

type HealthStatus = "checking" | "online" | "offline";

const PING_INTERVAL_MS = 30_000; // check every 30s
const RETRY_INTERVAL_MS = 8_000; // when offline, retry every 8s

export function useSupabaseHealth() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const check = useCallback(async () => {
    try {
      // Lightweight call – just reads the session; if Supabase is unreachable it throws
      const { error } = await supabase.auth.getSession();
      // A network error (no response) will throw; an auth error (like no session) is still "online"
      if (error && error.message?.toLowerCase().includes("network")) {
        throw new Error("network");
      }
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    // Initial check
    check();

    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        await check();
        schedule();
      }, status === "offline" ? RETRY_INTERVAL_MS : PING_INTERVAL_MS);
    };

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return status;
}
