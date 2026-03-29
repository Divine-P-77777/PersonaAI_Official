"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Image as ImageIcon, Link as LinkIcon, Type, Zap, Trash2, Database } from "lucide-react"
import { DataSource } from "@/types"

interface SourcesModalProps {
   isOpen: boolean;
   onClose: () => void;
   sources: DataSource[];
   onDeleteClick: (source: DataSource) => void;
}

export default function SourcesModal({ isOpen, onClose, sources, onDeleteClick }: SourcesModalProps) {
   React.useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   if (!isOpen) return null;

   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onClose}
                  className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
               />
               <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-2xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl z-10 flex flex-col max-h-[85vh]"
               >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-orange-50 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                           <Database size={24} />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-gray-900">All Sources</h2>
                           <p className="text-sm text-gray-500 font-medium">Viewing {sources.length} active documents</p>
                        </div>
                     </div>
                     <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  <div className="overflow-y-auto pr-2 space-y-4 flex-1 styling-scrollbar min-h-0 overscroll-contain pb-4">
                     {sources.map(source => (
                        <div key={source.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50/50 transition-colors border-2 border-transparent hover:border-orange-100 rounded-2xl group flex-wrap sm:flex-nowrap gap-4">
                           <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-400 shrink-0">
                                 {source.type === 'pdf' && <FileText size={20} />}
                                 {source.type === 'image' && <ImageIcon size={20} />}
                                 {source.type === 'web_link' && <LinkIcon size={20} />}
                                 {source.type === 'long_text' && <Type size={20} />}
                                 {source.type === 'video_link' && <Zap size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h5 className="font-bold text-gray-900 truncate">{source.title}</h5>
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    source.status === 'completed' ? 'text-green-500' : 
                                    source.status === 'failed' ? 'text-red-500' : 'text-orange-500 animate-pulse'
                                 }`}>
                                    {source.status}
                                 </span>
                              </div>
                           </div>
                           
                           <button 
                              onClick={() => onDeleteClick(source)}
                              className="p-3 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm shrink-0"
                              title="Delete source"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     ))}
                  </div>

               </motion.div>
            </div>
         )}
      </AnimatePresence>
   )
}
