"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Send, Share2, ArrowLeft, MoreVertical, ShieldCheck, X, User, RefreshCcw, FileUp, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { api } from "../../../services/api";
import { Bot } from "../../../types";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { clsx } from "clsx";
import Lenis from "lenis";
import { BotAvatar } from "../../explore/components/BotAvatar";
import { CreditWarningPopup } from "@/components/ui/CreditWarningPopup";

interface ChatInterfaceProps {
  bot: Bot;
}

export const ChatInterface = ({ bot }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Set initial value on client
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const router = useRouter();

  // Auto-resize textarea whenever input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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

  // Fetch Chat History on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await api.getChatHistory(bot.id);
        if (data.history && data.history.length > 0) {
          setMessages(data.history);
        } else {
          // Default greeting if no history
          setMessages([
            { role: "assistant", content: `Hi, I'm ${bot.name}. ${bot.description || "How can I help you today?"}` }
          ]);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
        // Fallback to greeting
        setMessages([
          { role: "assistant", content: `Hi, I'm ${bot.name}. ${bot.description || "How can I help you today?"}` }
        ]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [bot.id, bot.name, bot.description]);

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
        text: `Check out this AI persona of ${bot.name} on AskMentor!`,
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch((err: any) => {
          console.error("Clipboard write failed:", err);
          toast.error("Failed to copy link.");
        });
    }
  };

  const handleFreshSession = async () => {
    if (!confirm("Are you sure you want to clear your chat history? This cannot be undone.")) return;

    try {
      await api.clearChatHistory(bot.id);
      setMessages([
        { role: "assistant", content: `Hi, I'm ${bot.name}. ${bot.description || "How can I help you today?"}` }
      ]);
      toast.success("Started fresh session!");
    } catch (err) {
      console.error("Failed to clear history:", err);
      toast.error("Failed to start fresh session.");
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} coming soon! `, {
      position: "bottom-center",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const processFile = async (file: File) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, PNG, or JPG files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB.");
      return;
    }
    setAttachedFile(file);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";
    await processFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const [warningPopup, setWarningPopup] = useState<{ isOpen: boolean; mode: 'warning' | 'blocked'; message?: string }>({ isOpen: false, mode: 'warning' });
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  useEffect(() => {
    api.getBotAccess(bot.id).then(res => {
      if (res.credits_remaining !== undefined) {
        setCreditsRemaining(res.credits_remaining);
      }

      // Auto-trigger popup on load if they have no access
      if (res.has_access === false) {
        if (res.status === 'expired') {
          setWarningPopup({ isOpen: true, mode: 'blocked', message: "Your access to this mentor has expired." });
        } else if (res.credits_remaining === 0) {
          setWarningPopup({ isOpen: true, mode: 'blocked', message: "You've used all your free credits for this mentor." });
        } else if (res.status === null && res.free_trials_remaining_this_month === 0) {
          setWarningPopup({ isOpen: true, mode: 'blocked', message: "Your free trial for this mentor has ended. Unlock to continue." });
        }
      }
    }).catch(console.error);
  }, [bot.id]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isStreaming) return;

    const userMessage = input.trim();
    const fileToSend = attachedFile;

    setInput("");
    setAttachedFile(null);

    if (fileToSend) {
      setMessages(prev => [...prev, { role: "user", content: userMessage ? `📎 **Uploaded File:** ${fileToSend.name}\n\n${userMessage}` : `📎 **Uploaded File:** ${fileToSend.name}` }]);
      lenisRef.current?.scrollTo("bottom", { duration: 0.4 });

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      setIsUploadingResume(true);
      toast.info("Uploading and analyzing your file...");

      try {
        const result = await api.reviewResume(bot.id, fileToSend);
        toast.success("File reviewed successfully!");
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: result.review };
          return next;
        });

        if (creditsRemaining !== null) {
          const newCredits = creditsRemaining - 4;
          setCreditsRemaining(newCredits);
          if (newCredits <= 1 && newCredits > 0) {
            setWarningPopup({ isOpen: true, mode: 'warning' });
          } else if (newCredits <= 0) {
            setWarningPopup({ isOpen: true, mode: 'blocked', message: "You've used all your credits for this mentor." });
          }
        }
      } catch (err: any) {
        setMessages(prev => prev.slice(0, -2));
        const detail = err?.message || "File review failed. Please try again.";
        if (detail.includes("INSUFFICIENT_CREDITS") || detail.includes("ACCESS_EXPIRED") || detail.includes("EXPLORATION_LIMIT_REACHED")) {
          setWarningPopup({ isOpen: true, mode: 'blocked', message: detail });
        } else {
          toast.error(detail);
        }
      } finally {
        setIsUploadingResume(false);
      }
    } else if (userMessage) {
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      lenisRef.current?.scrollTo("bottom", { duration: 0.4 });
      setIsStreaming(true);
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
          () => {
            setIsStreaming(false);
            if (creditsRemaining !== null) {
              const newCredits = creditsRemaining - 1;
              setCreditsRemaining(newCredits);
              if (newCredits === 1) {
                setWarningPopup({ isOpen: true, mode: 'warning' });
              } else if (newCredits === 0) {
                setWarningPopup({ isOpen: true, mode: 'blocked', message: "You've used all your free credits for this mentor." });
              }
            }
          },
          (err) => {
            setIsStreaming(false);
            if (err && (err.code === "INSUFFICIENT_CREDITS" || err.code === "EXPLORATION_LIMIT_REACHED" || err.code === "ACCESS_EXPIRED")) {
              setWarningPopup({ isOpen: true, mode: 'blocked', message: err.message });
              setMessages((prev) => prev.slice(0, -2));
            } else {
              console.error("Streaming error:", err);
              toast.error(typeof err === 'string' ? err : (err.message || "Failed to get response. Please try again."));
              setMessages((prev) => prev.slice(0, -2));
            }
          }
        );
      } catch (err) {
        console.error("Chat error:", err);
        setIsStreaming(false);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      data-lenis-prevent
      className="flex flex-col h-[100dvh] bg-zinc-50 overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-orange-500/10 backdrop-blur-sm border-4 border-dashed border-orange-500/50 m-4 md:m-8 rounded-[3rem] flex flex-col items-center justify-center pointer-events-none shadow-2xl"
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 text-orange-500 animate-bounce">
              <FileUp size={48} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 drop-shadow-sm mb-2">Drop your file here</h3>
            <p className="text-gray-600 font-bold bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-md">Supports PDF, PNG, JPG (Max 5MB)</p>
          </motion.div>
        )}
      </AnimatePresence>
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
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-white overflow-hidden">
                  <BotAvatar bot={bot} className="w-full h-full" />
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
            className="p-3 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all active:scale-95 z-50 relative"
          >
            <MoreVertical size={18} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                {/* Invisible overlay for click-outside to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
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
                  <div
                    onClick={handleFreshSession}
                    className="px-4 py-3 hover:bg-red-50 hover:text-red-600 text-gray-700 flex items-center gap-3 cursor-pointer transition-colors border-t border-gray-50"
                  >
                    <RefreshCcw size={16} />
                    <span className="font-semibold text-sm">Fresh Session</span>
                  </div>


                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <main
        ref={scrollRef}
        data-lenis-prevent
        className="flex-1 overflow-y-auto pt-24 px-4 md:px-8 relative scrollbar-hide"
      >
        <div className="max-w-4xl mx-auto pt-8 pb-48 md:pb-56">
          <AnimatePresence mode="popLayout">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">Loading conversation...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  isStreaming={isStreaming && idx === messages.length - 1}
                />
              ))
            )}
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
              {attachedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100/80 rounded-[1.5rem] mx-2 mb-2 w-fit border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <FileUp size={16} />
                  </div>
                  <div className="flex flex-col max-w-[150px] md:max-w-[200px]">
                    <span className="text-[13px] font-bold text-gray-900 truncate leading-tight">{attachedFile.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{attachedFile.type.split('/')[1] || 'FILE'}</span>
                  </div>
                  <button onClick={() => setAttachedFile(null)} className="ml-1 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2 px-2">
                <div className="flex items-center pb-1.5 pl-1 md:pl-2">
                  {/* Hidden file input for resume upload */}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleResumeUpload}
                  />
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={isUploadingResume || isStreaming}
                    title={isUploadingResume ? "Reviewing resume…" : "Upload resume for AI review (PDF/PNG/JPG)"}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed aspect-square shrink-0"
                  >
                    {isUploadingResume
                      ? <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      : <FileUp className="w-4 h-4 md:w-5 md:h-5 shrink-0" />}
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isMobile ? "Ask anything..." : `Ask ${bot.name} anything...`}
                  className="flex-1 bg-transparent px-2 py-3 outline-none text-gray-800 resize-none max-h-32 md:max-h-48 overflow-y-auto scrollbar-hide text-[15px] font-medium placeholder:text-gray-400 self-center"
                  style={{ minHeight: "48px" }}
                />

                <div className="pb-1.5 pr-1.5 flex items-center gap-1 md:pr-2">
                  {(!input.trim() && !attachedFile) && !isStreaming ? (
                    <Link href={`/live/${bot.id}`} title="Enter live interaction">
                      <button
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all active:scale-90"
                      >
                        <Radio size={20} />
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={(!input.trim() && !attachedFile) || isStreaming}
                      className={clsx(
                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shrink-0",
                        (!input.trim() && !attachedFile) || isStreaming
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-gray-900 text-white shadow-md hover:bg-gray-800"
                      )}
                    >
                      <Send size={18} className={clsx(isStreaming && "animate-pulse", "-ml-0.5")} />
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Notice below the input bar */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-gray-400 font-medium">
                AskMentor can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <CreditWarningPopup
        isOpen={warningPopup.isOpen}
        mode={warningPopup.mode}
        message={warningPopup.message}
        onClose={() => setWarningPopup(prev => ({ ...prev, isOpen: false }))}
        onUpgrade={() => router.push(`/billing`)}
      />
    </div>
  );
};
