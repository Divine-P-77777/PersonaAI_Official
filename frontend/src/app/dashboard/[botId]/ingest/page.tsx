"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, 
  Link as LinkIcon, 
  Type, 
  Trash2, 
  Plus, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Zap,
  ChevronRight,
  Database,
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { api } from "@/services/api"
import { useToast } from "@/hooks/useToast"
import { useRouter } from "next/navigation"

type SourceType = "pdf" | "image" | "long_text" | "web_link"

interface StagedSource {
  id: string
  type: SourceType
  title: string
  content?: string
  url?: string
  file?: File
}

export default function IngestionPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = React.use(params)
  const [sources, setSources] = useState<StagedSource[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchStatus, setBatchStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending")
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const { showSuccess, showError } = useToast()
  const router = useRouter()

  const addSource = (type: SourceType) => {
    const newSource: StagedSource = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: "",
      ...(type === "long_text" ? { content: "" } : {}),
      ...(type === "web_link" ? { url: "" } : {})
    }
    setSources([...sources, newSource])
  }

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        try {
          // If it's a websocket, close it
          if (typeof (pollRef.current as any).close === 'function') {
            (pollRef.current as any).close();
          } else {
            clearInterval(pollRef.current as any);
          }
        } catch (e) {}
      }
    };
  }, []);

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id))
  }

  const updateSource = (id: string, updates: Partial<StagedSource>) => {
    setSources(sources.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateSource(id, { file, title: file.name })
    }
  }

  const startPolling = (id: string, total: number) => {
    try {
      const wsUrl = `${api.getWsUrl()}/ingestion/batch/${id}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const batch = JSON.parse(event.data);
          
          if (batch.error) {
            showError(batch.error);
            ws.close();
            return;
          }

          const pct = total > 0 ? Math.round((batch.processed_files / total) * 100) : 0;
          setBatchProgress(pct);
          setBatchStatus(batch.status);
          
          if (batch.status === "completed" || batch.status === "failed") {
            ws.close();
            if (batch.status === "completed") {
              showSuccess("All sources processed successfully! 🎉");
            } else {
              showError("Some sources failed to process. Check logs.");
            }
          }
        } catch (err) {
          console.error("WS Parse error", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      pollRef.current = ws as any;
    } catch (err) {
      console.error("Failed to establish WebSocket:", err);
      showError("Connection failed for live progress.");
    }
  }

  const handleStartIngestion = async () => {
    if (sources.length === 0) return

    setIsUploading(true)
    try {
      const formattedSources = sources.map(s => ({
        type: s.type as any,
        title: s.title || (s.type === 'web_link' ? (s.url || 'Untitled Link') : 'Untitled Source'),
        content: s.content,
        url: s.url
      }))

      const files = sources.filter(s => s.file).map(s => s.file!)
      
      const batch = await api.createIngestionBatch(botId, formattedSources, files)
      setBatchId(batch.id)
      setBatchStatus("processing")
      setBatchProgress(0)
      setShowStatus(true)
      startPolling(batch.id, sources.length)
      showSuccess("Knowledge ingestion started! Processing in background...")
    } catch (err: any) {
      console.error("Ingestion failed:", err)
      showError(err.message || "Failed to start ingestion.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-gray-900 font-sans selection:bg-orange-200">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
                href={`/dashboard/${botId}`}
                className="p-2 hover:bg-orange-50 rounded-xl text-gray-400 hover:text-orange-600 transition-all"
            >
                <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Database className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    Knowledge Hub
                </span>
            </div>
          </div>
          <Link 
            href={`/dashboard/${botId}`}
            className="text-gray-500 hover:text-orange-600 transition-colors text-sm font-bold bg-gray-50 px-4 py-2 rounded-xl"
          >
            Done
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-32 pb-24 px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Feed your <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium">Upload documents, paste links, or write text to build your persona's knowledge base.</p>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { type: "pdf", icon: FileText, label: "PDF", color: "orange" },
            { type: "image", icon: Zap, label: "Image", color: "orange" },
            { type: "web_link", icon: LinkIcon, label: "Web Link", color: "pink" },
            { type: "long_text", icon: Type, label: "Long Text", color: "pink" }
          ].map((btn) => (
            <button 
              key={btn.type}
              onClick={() => addSource(btn.type as SourceType)}
              className="h-16 px-4 bg-white border-2 border-orange-50 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-orange-200 hover:bg-orange-50/30 transition-all group shadow-sm"
            >
              <btn.icon size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
              <span className="text-xs font-bold text-gray-600">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Staged Sources */}
        <div className="space-y-6 mb-12">
          <AnimatePresence initial={false}>
            {sources.length === 0 ? (
              <div className="h-72 rounded-[40px] border-2 border-dashed border-orange-100 bg-orange-50/20 flex flex-col items-center justify-center text-orange-400 gap-4">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-inner">
                   <Plus size={32} />
                </div>
                <p className="font-bold">Add your first data source to begin</p>
              </div>
            ) : (
              sources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border-2 border-orange-50 rounded-[32px] p-6 group relative shadow-sm hover:shadow-md transition-all"
                >
                  <button 
                    onClick={() => removeSource(source.id)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-10"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center text-orange-600 shrink-0">
                      {source.type === "pdf" && <FileText size={24} />}
                      {source.type === "web_link" && <LinkIcon size={24} />}
                      {source.type === "long_text" && <Type size={24} />}
                      {source.type === "image" && <Zap size={24} />}
                    </div>
                    
                    <div className="flex-1 space-y-4 min-w-0 mt-4 sm:mt-0 pt-6 sm:pt-0">
                      {source.type === "web_link" ? (
                        <div className="space-y-4 min-w-0">
                          <input
                            type="text"
                            placeholder="Data source title (e.g. Personal Portfolio)"
                            className="w-full bg-transparent border-none outline-none text-xl font-bold text-gray-900 placeholder-gray-300"
                            value={source.title}
                            onChange={(e) => updateSource(source.id, { title: e.target.value })}
                          />
                          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-4 border-2 border-orange-50 focus-within:border-orange-200 transition-colors">
                            <span className="text-gray-400 font-bold shrink-0">https://</span>
                            <input
                              type="text"
                              placeholder="example.com/article"
                              className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-700 font-medium"
                              value={source.url}
                              onChange={(e) => updateSource(source.id, { url: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : source.type === "long_text" ? (
                        <div className="space-y-4 min-w-0">
                          <input
                            type="text"
                            placeholder="Text block title (e.g. My Philosphy)"
                            className="w-full bg-transparent border-none outline-none text-xl font-bold text-gray-900 placeholder-gray-300"
                            value={source.title}
                            onChange={(e) => updateSource(source.id, { title: e.target.value })}
                          />
                          <textarea
                            placeholder="Paste or write your text here..."
                            className="w-full h-40 bg-gray-50 border-2 border-orange-50 rounded-2xl px-5 py-4 outline-none focus:border-orange-200 transition-colors resize-none text-gray-700 font-medium"
                            value={source.content}
                            onChange={(e) => updateSource(source.id, { content: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4 min-w-0">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <input
                              type="text"
                              placeholder="Filename"
                              className="w-full sm:flex-1 bg-transparent border-none outline-none text-xl font-bold text-gray-900 placeholder-gray-300 pointer-events-none truncate"
                              value={source.title}
                              readOnly
                            />
                            {!source.file && (
                                <label className="h-12 w-full sm:w-auto px-6 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-100 hover:scale-105 transition-all shrink-0">
                                  <Upload size={16} /> Browse
                                  <input type="file" className="hidden" accept={source.type === 'pdf' ? '.pdf' : 'image/*'} onChange={(e) => handleFileUpload(source.id, e)} />
                                </label>
                            )}
                          </div>
                          {source.file && (
                            <div className="py-3 px-5 bg-green-50 border-2 border-green-100 text-green-600 rounded-2xl text-sm font-bold inline-flex items-center gap-2">
                                <CheckCircle2 size={18} /> {source.file.name} ready for secure upload
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Global Action */}
        {sources.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
            <button
              onClick={handleStartIngestion}
              disabled={isUploading}
              className="w-full h-18 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="animate-pulse">Starting Ingestion...</span>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-orange-400" /> Start Batch Ingestion ({sources.length} items)
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Overlay with Live Progress Bar */}
        <AnimatePresence>
          {showStatus && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-orange-100 to-pink-100 shadow-xl flex items-center justify-center mx-auto mb-8 relative">
                  {batchStatus === "completed" ? (
                    <CheckCircle2 className="text-green-500" size={48} />
                  ) : batchStatus === "failed" ? (
                    <AlertCircle className="text-red-500" size={48} />
                  ) : (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-2 rounded-[40px] border-2 border-orange-200 border-t-pink-500"
                      />
                      <Zap className="text-orange-600 fill-orange-600" size={48} />
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  {batchStatus === "completed" ? "Knowledge Ingested! 🎉" 
                   : batchStatus === "failed" ? "Some Sources Failed"
                   : "Processing Knowledge..."}
                </h2>

                {/* Status badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 ${
                  batchStatus === "completed" ? "bg-green-50 text-green-600"
                  : batchStatus === "failed" ? "bg-red-50 text-red-600"
                  : "bg-orange-50 text-orange-600"
                }`}>
                  {batchStatus === "processing" && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  )}
                  {batchStatus}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm font-bold text-gray-500 mb-2">
                    <span>Progress</span>
                    <span className={batchStatus === "completed" ? "text-green-600" : "text-orange-600"}>
                      {batchProgress}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        batchStatus === "failed" 
                          ? "bg-gradient-to-r from-red-400 to-red-500"
                          : "bg-gradient-to-r from-orange-400 to-pink-500"
                      }`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${batchProgress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    {batchStatus === "completed"
                      ? "All sources successfully embedded into the knowledge base."
                      : batchStatus === "failed"
                      ? "Some sources failed — please check the error logs."
                      : "OCR → Chunking → Embedding → Vector DB write..."}
                  </p>
                </div>

                {/* Action button */}
                {(batchStatus === "completed" || batchStatus === "failed") && (
                  <button
                    onClick={() => router.push(`/dashboard/${botId}`)}
                    className="mt-6 w-full h-14 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Go to Persona Dashboard
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
