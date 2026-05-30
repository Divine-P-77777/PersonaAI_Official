"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileText, Image as ImageIcon, Link as LinkIcon, Type, Zap, Trash2, Database, Loader2 } from "lucide-react"
import { DataSource } from "@/types"
import ConfirmDeleteModal from "./ConfirmDeleteModal"

interface SourcesModalProps {
   isOpen: boolean;
   onClose: () => void;
   sources: DataSource[];
   onDeleteClick: (source: DataSource) => void;
   onDeleteBulk?: (sourceIds: string[]) => Promise<void>;
}

export default function SourcesModal({ isOpen, onClose, sources, onDeleteClick, onDeleteBulk }: SourcesModalProps) {
   const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
   const [isDeleting, setIsDeleting] = React.useState(false);
   const [showConfirm, setShowConfirm] = React.useState(false);

   React.useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
         setSelectedIds(new Set()); // Reset selection on close
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   const toggleSelect = (id: string) => {
      const next = new Set(selectedIds);
      if (next.has(id)) {
         next.delete(id);
      } else {
         next.add(id);
      }
      setSelectedIds(next);
   };

   const toggleSelectAll = () => {
      if (selectedIds.size === sources.length) {
         setSelectedIds(new Set());
      } else {
         setSelectedIds(new Set(sources.map(s => s.id)));
      }
   };

   const handleBulkDelete = async () => {
      if (selectedIds.size === 0 || !onDeleteBulk) return;
      
      setIsDeleting(true);
      try {
         await onDeleteBulk(Array.from(selectedIds));
         setSelectedIds(new Set());
         setShowConfirm(false);
      } finally {
         setIsDeleting(false);
      }
   };

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
                  className="relative w-full max-w-2xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden"
               >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-orange-50 shrink-0">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-orange-700 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                           <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                           <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight truncate">All Sources</h2>
                           <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="text-[10px] sm:text-sm text-gray-500 font-medium truncate">Viewing {sources.length} docs</p>
                              {sources.length > 0 && onDeleteBulk && (
                                 <button 
                                    onClick={toggleSelectAll}
                                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-orange-700 hover:text-orange-800 px-2 py-0.5 rounded-lg bg-orange-50 transition-all border border-orange-100 w-fit"
                                    aria-label={selectedIds.size === sources.length ? "Deselect all sources" : "Select all sources"}
                                 >
                                    {selectedIds.size === sources.length ? "Deselect" : "Select All"}
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>
                     <button 
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all shrink-0"
                        aria-label="Close Modal"
                     >
                        <X size={24} />
                     </button>
                  </div>

                  <div 
                     className="overflow-y-auto pr-2 space-y-4 flex-1 overscroll-contain pb-32 styling-scrollbar min-h-0"
                     data-lenis-prevent
                  >
                     {sources.map(source => {
                        const isSelected = selectedIds.has(source.id);
                        return (
                           <motion.div 
                              layout
                              key={source.id} 
                              className={`flex items-center gap-4 p-4 transition-all border-2 rounded-2xl group flex-wrap sm:flex-nowrap cursor-pointer ${
                                 isSelected 
                                 ? "bg-orange-50/80 border-orange-200 shadow-sm" 
                                 : "bg-gray-50 hover:bg-orange-50/50 border-transparent hover:border-orange-100"
                              }`}
                              onClick={() => toggleSelect(source.id)}
                           >
                              {/* Custom Checkbox */}
                              <div className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${
                                 isSelected ? "bg-orange-500 border-orange-500" : "bg-white border-orange-100 group-hover:border-orange-200 shadow-inner"
                              }`}>
                                 <motion.div 
                                    initial={false}
                                    animate={{ scale: isSelected ? 1 : 0 }}
                                    className="text-white"
                                 >
                                    <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1" />
                                 </motion.div>
                              </div>

                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                 <div className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? "bg-white text-orange-700" : "bg-white text-orange-600"
                                 }`}>
                                    {source.type === 'pdf' && <FileText size={20} />}
                                    {source.type === 'image' && <ImageIcon size={20} />}
                                    {source.type === 'web_link' && <LinkIcon size={20} />}
                                    {source.type === 'long_text' && <Type size={20} />}
                                    {source.type === 'video_link' && <Zap size={20} />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-gray-900 truncate" title={source.title}>{source.title}</h5>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                       source.status === 'completed' ? 'text-green-600' : 
                                       source.status === 'failed' ? 'text-red-600' : 'text-orange-600 animate-pulse'
                                    }`}>
                                       {source.status}
                                    </span>
                                 </div>
                              </div>
                              
                              {!isSelected && (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteClick(source); }}
                                    className="p-3 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm shrink-0 sm:opacity-0 group-hover:opacity-100"
                                    aria-label={`Delete knowledge source: ${source.title}`}
                                    title="Delete source"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              )}
                           </motion.div>
                        );
                     })}
                  </div>

                  {/* Bulk Action Bar */}
                  <AnimatePresence>
                     {selectedIds.size > 0 && (
                        <motion.div 
                           initial={{ y: 100, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           exit={{ y: 100, opacity: 0 }}
                           className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-3 sm:p-4 bg-gray-900 rounded-[20px] sm:rounded-[24px] shadow-2xl flex items-center justify-between z-20 border border-gray-800"
                        >
                           <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center font-black text-sm sm:text-base">
                                 {selectedIds.size}
                              </div>
                              <div className="hidden md:block">
                                 <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-0.5">Selection active</p>
                                 <p className="text-xs sm:text-sm text-white font-bold leading-none">Delete multiple items?</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 sm:gap-3">
                              <button 
                                 onClick={() => setSelectedIds(new Set())}
                                 className="px-3 sm:px-6 py-2 text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors"
                              >
                                 Cancel
                              </button>
                              <button 
                                 onClick={() => setShowConfirm(true)}
                                 disabled={isDeleting}
                                 className="px-4 sm:px-8 py-2.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-900/20 hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                              >
                                 <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                 <span className="hidden xs:inline">Delete</span>
                                 <span className="inline xs:hidden">Del</span>
                              </button>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

               </motion.div>

               {/* Confirmation Modal overlaying on top */}
               <ConfirmDeleteModal
                  isOpen={showConfirm}
                  onClose={() => setShowConfirm(false)}
                  onConfirm={handleBulkDelete}
                  sourceTitle={`${selectedIds.size} selected document${selectedIds.size > 1 ? 's' : ''}`}
                  isDeleting={isDeleting}
               />
            </div>
         )}
      </AnimatePresence>
   )
}
