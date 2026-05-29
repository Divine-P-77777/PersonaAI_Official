import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface CreditWarningPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  mode: "warning" | "blocked";
  message?: string;
}

export function CreditWarningPopup({ isOpen, onClose, onUpgrade, mode, message }: CreditWarningPopupProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center mt-4">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-sm border ${
              mode === 'blocked' 
                ? 'bg-red-50 text-red-500 border-red-100' 
                : 'bg-orange-50 text-orange-500 border-orange-100'
            }`}>
              {mode === 'blocked' ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
              {mode === 'blocked' ? 'Out of Credits' : 'Running Low!'}
            </h3>
            
            <p className="text-gray-500 font-medium mb-8 leading-relaxed text-sm">
              {message || (mode === 'blocked' 
                ? "You need credits for further interactions." 
                : "You have left 1 interaction. Upgrade to keep chatting without interruption.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                onClick={onClose}
                className="flex-1 py-3.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                Close
              </button>
              <button 
                onClick={onUpgrade}
                className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg hover:shadow-orange-500/20 transition-all text-sm"
              >
                Upgrade
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
