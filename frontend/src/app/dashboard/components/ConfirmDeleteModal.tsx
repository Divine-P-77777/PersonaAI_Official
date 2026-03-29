"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, Loader2 } from "lucide-react"

interface ConfirmDeleteModalProps {
   isOpen: boolean;
   onClose: () => void;
   onConfirm: () => void;
   sourceTitle: string;
   isDeleting: boolean;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, sourceTitle, isDeleting }: ConfirmDeleteModalProps) {
   return (
      <AnimatePresence>
         {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
                  className="relative w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl z-10 overflow-hidden"
               >
                  <button 
                     onClick={onClose}
                     className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                  >
                     <X size={20} />
                  </button>

                  <div className="flex flex-col items-center text-center mt-4">
                     <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm border-8 border-red-50/50">
                        <AlertTriangle size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Source?</h3>
                     <p className="text-gray-500 font-medium mb-1">
                        Are you sure you want to permanently delete:
                     </p>
                     <p className="text-gray-900 font-bold mb-8 px-4 py-2 bg-gray-50 rounded-xl truncate max-w-full">
                        {sourceTitle}
                     </p>

                     <div className="flex items-center gap-3 w-full">
                        <button
                           onClick={onClose}
                           disabled={isDeleting}
                           className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={onConfirm}
                           disabled={isDeleting}
                           className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 hover:shadow-red-300 transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:hover:scale-100"
                        >
                           {isDeleting ? (
                               <Loader2 size={18} className="animate-spin" />
                           ) : (
                               "Delete Now"
                           )}
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
   )
}
