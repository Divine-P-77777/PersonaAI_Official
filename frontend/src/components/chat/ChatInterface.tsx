"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Send, Share2, ArrowLeft, MoreVertical, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { api } from "../../services/api";
import { Bot } from "../../types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { clsx } from "clsx";
import Lenis from "lenis";

interface ChatInterfaceProps {
  bot: Bot;
}

export const ChatInterface = ({ bot }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: `Hi, I'm ${bot.name}. ${bot.description || "How can I help you today?"}` }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const router = useRouter();

  // Initialize Local Lenis for the Chat Container
  useLayoutEffect(() => {
    if (!scrollRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: scrollRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Intelligent Auto-scroll on new messages
  useEffect(() => {
    if (lenisRef.current) {
      // One-frame delay (16ms) ensures React has rendered the new content
      const timer = setTimeout(() => {
        lenisRef.current?.scrollTo("bottom", {
          duration: isStreaming ? 1.0 : 0.4,
          lock: true, 
        });
      }, 16);
      return () => clearTimeout(timer);
    }
  }, [messages, isStreaming]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Chat with ${bot.name}`,
        text: `Check out this AI persona of ${bot.name} on PersonaBot!`,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    
    // Immediate scroll to show the user message
    lenisRef.current?.scrollTo("bottom", { duration: 0.4 });
    
    setIsStreaming(true);

    // Initial assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await api.chatWithBot(
        bot.id,
        userMessage,
        (token) => {
          setMessages((prev) => {
            const next = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...next, { ...last, content: last.content + token }];
            }
            return prev;
          });
        },
        () => setIsStreaming(false),
        (err) => {
          console.error("Streaming error:", err);
          setIsStreaming(false);
          toast.error("Failed to get response. Please try again.");
        }
      );
    } catch (err) {
      console.error("Chat error:", err);
      setIsStreaming(false);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div 
      data-lenis-prevent
      className="flex flex-col h-screen bg-zinc-50 overflow-hidden relative"
    >
      {/* Fixed Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-pink-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-[1.1rem] bg-white overflow-hidden p-0.5">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${bot.name}`}
                    alt={bot.name}
                    className="w-full h-full object-cover rounded-[1rem]"
                  />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-gray-900 leading-tight truncate max-w-[120px] md:max-w-none">
                  {bot.name}
                </h2>
                <ShieldCheck size={14} className="text-blue-500" />
              </div>
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none">
                AI Persona • Online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
             className="p-3 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all active:scale-95"
          >
            <MoreVertical size={18} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden py-1 z-50"
              >
                <div 
                   onClick={() => { handleShare(); setIsDropdownOpen(false); }}
                   className="px-4 py-3 hover:bg-orange-50 hover:text-orange-600 text-gray-700 flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <Share2 size={16} />
                  <span className="font-semibold text-sm">Share Persona</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <main
        ref={scrollRef}
        data-lenis-prevent
        className="flex-1 overflow-y-auto pt-24 pb-60 px-4 md:px-8 relative scrollbar-hide"
      >
        <div className="max-w-4xl mx-auto py-8">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg}
                isStreaming={isStreaming && idx === messages.length - 1}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Floated Input Bar with Backdrop Blur */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-8 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="relative group">
            {/* Soft Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-[2.5rem] blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity duration-700" />

            {/* The Floating Bubble */}
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2">
              <div className="flex items-end gap-3 px-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Ask ${bot.name} anything...`}
                  className="flex-1 bg-transparent px-4 py-4 outline-none text-gray-800 resize-none max-h-48 scrollbar-hide text-[15px] font-medium placeholder:text-gray-400"
                />

                <div className="pb-1.5 pr-1.5">
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 shrink-0",
                      !input.trim() || isStreaming
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-900 text-white shadow-lg hover:shadow-orange-500/20 hover:bg-orange-600"
                    )}
                  >
                    <Send size={20} className={clsx(isStreaming && "animate-pulse")} />
                  </button>
                </div>
              </div>

              {/* Notice built into the float */}
              <div className="px-6 pb-2 text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                  PersonaBot can make mistakes. Check important info.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
