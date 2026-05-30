"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, ServerCrash } from "lucide-react";
import { useSupabaseHealth } from "@/hooks/useSupabaseHealth";

export function ServerDownBanner() {
  const status = useSupabaseHealth();
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    if (status === "offline") {
      setVisible(true);
      setWasOffline(true);
      setShowRecovered(false);
    } else if (status === "online" && wasOffline) {
      // Show a brief "back online" confirmation before hiding
      setVisible(false);
      setShowRecovered(true);
      const t = setTimeout(() => setShowRecovered(false), 4000);
      return () => clearTimeout(t);
    }
  }, [status, wasOffline]);

  return (
    <>
      {/* ───── Server-Down Banner ───── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="server-down"
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
          >
            {/* Backdrop blur strip */}
            <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 shadow-2xl shadow-red-900/40">
              {/* Left glow orb */}
              <span className="absolute left-4 w-6 h-6 rounded-full bg-white/20 blur-lg animate-ping" />

              <div className="flex items-center gap-3 max-w-2xl w-full justify-center">
                {/* Pulsing icon */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                  <div className="relative w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ServerCrash size={16} className="text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-white font-black text-sm tracking-wide leading-tight">
                    🔴 Server Temporarily Down
                  </p>
                  <p className="text-red-100 text-xs font-medium mt-0.5">
                    Our servers are unreachable. We're attempting to reconnect automatically…
                  </p>
                </div>

                {/* Spinner */}
                <div className="shrink-0">
                  <RefreshCw
                    size={16}
                    className="text-white/70 animate-spin"
                    style={{ animationDuration: "2s" }}
                  />
                </div>
              </div>

              {/* Right glow orb */}
              <span className="absolute right-4 w-6 h-6 rounded-full bg-white/20 blur-lg animate-ping" style={{ animationDelay: "0.5s" }} />
            </div>

            {/* Decorative bottom border shimmer */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Back-Online Toast ───── */}
      <AnimatePresence>
        {showRecovered && (
          <motion.div
            key="back-online"
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          >
            <div className="flex items-center gap-2.5 px-5 py-3 bg-emerald-500 rounded-2xl shadow-2xl shadow-emerald-900/30">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <WifiOff size={14} className="text-white opacity-70 rotate-180" />
              <span className="text-white font-black text-sm tracking-wide">
                ✅ Back Online — Connection Restored
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
