"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Bot as BotType } from "@/types";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

export default function BotTestPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = React.use(params);
  const [bot, setBot] = useState<BotType | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchBot = async () => {
      try {
        setLoading(true);
        const data = await api.getBot(botId);
        setBot(data);
      } catch (err: any) {
        showError("Could not load bot for testing.");
      } finally {
        setLoading(false);
      }
    };
    fetchBot();
  }, [botId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 size={40} className="text-orange-500" />
        </motion.div>
        <p className="text-gray-500 font-medium animate-pulse uppercase tracking-widest text-xs">
          Initializing Sandbox...
        </p>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Bot Not Found</h1>
        <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
          We couldn't load the persona for the testing environment.
        </p>
        <Link 
            href="/dashboard"
            className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
        >
            <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
      {/* Sandbox Indicator Overlay (Fixed so it doesn't block interaction) */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
          <div className="px-4 py-1.5 bg-orange-500/10 backdrop-blur-md rounded-full border border-orange-500/20 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                Sandbox Environment
              </span>
          </div>
      </div>

      <ChatInterface bot={bot} />
    </div>
  );
}
