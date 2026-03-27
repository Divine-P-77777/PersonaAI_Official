"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Share2, ArrowLeft, MoreVertical, ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { api } from "../../services/api";
import { Bot } from "../../types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { clsx } from "clsx";

interface ChatInterfaceProps {
  bot: Bot;
}

export const ChatInterface = ({ bot }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: `Hi, I'm ${bot.name}. ${bot.description || "How can I help you today?"}` }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
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
    setIsStreaming(true);

    // Initial assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await api.chatWithBot(
        bot.id,
        userMessage,
        (token) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              last.content += token;
            }
            return next;
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
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden relative">
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

        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-3 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all active:scale-95"
          >
            <Share2 size={18} />
          </button>
          <button className="p-3 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all active:scale-95">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-24 pb-32 px-4 md:px-8"
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

      {/* Fixed Sticky Input Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 md:p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-[2rem] blur group-focus-within:opacity-100 opacity-0 transition-opacity duration-500" />
          <div className="relative flex items-end gap-3 p-2.5 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
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
              className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-800 resize-none max-h-48 scrollbar-hide text-[15px] font-medium placeholder:text-gray-400"
            />
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
          
          <div className="flex justify-center mt-3">
             <p className="text-[10px] text-gray-400 font-medium">
                PersonaBot can make mistakes. Check important info.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
