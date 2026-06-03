"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Unlock, Zap, ShieldCheck } from 'lucide-react';
import { Bot } from '@/types/index';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { Loader } from './Loader';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Bot | null;
  onUnlocked?: (botId: string) => void;
}

export function UnlockModal({ isOpen, onClose, bot, onUnlocked }: UnlockModalProps) {
  const router = useRouter();
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !bot) return null;

  const isFree = bot.is_free;
  const freeUsed = bot.free_explorations_used || 0;
  const freeLimit = 3; // Free mentors per month

  const handleUnlock = async () => {
    setIsLoading(true);

    // Paid bot — route to chat which handles payment redirect internally
    if (!isFree) {
      router.push(`/chat/${bot.id}`);
      return;
    }

    // Free bot — check monthly quota before proceeding
    if (freeUsed >= freeLimit) {
      showError(`You have already unlocked ${freeLimit} free mentors this month.`);
      setIsLoading(false);
      return;
    }

    try {
      if (isFree) {
        // Explicitly unlock the free bot (consumes quota and creates DB record)
        await import('@/services/api').then(m => m.api.unlockFreeBot(bot.id));
      }
    } catch (e: any) {
      // Access check failed or quota exhausted on the server — show error
      showError(e?.message || 'Could not verify access. Please try again.');
      setIsLoading(false);
      return;
    }

    // Notify parent to flip this bot's icon from Lock → MessageSquare
    onUnlocked?.(bot.id);
    onClose();
    // Navigate to chat — first message will finalize the access record
    router.push(`/chat/${bot.id}`);
  };

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
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
              {isFree ? <ShieldCheck size={32} /> : <Unlock size={32} />}
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
              Unlock {bot.name}
            </h3>

            {isFree ? (
              <div className="text-sm font-medium text-gray-500 mb-8 space-y-2">
                <p>This is a Free Mentor.</p>
                <p>You can unlock up to <span className="font-bold text-gray-900">{freeLimit}</span> free mentors per month.</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg mt-2">
                  <Zap size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-gray-700">{freeUsed} / {freeLimit} used this month</span>
                </div>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-500 mb-8 space-y-2">
                <p>This is a Premium Mentor.</p>
                <p>Unlock access for <span className="font-bold text-gray-900">₹{bot.unlock_price || 99}</span> to start learning.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 shadow-lg hover:shadow-orange-500/20 transition-all text-sm disabled:opacity-70"
              >
                {isLoading ? <Loader size="20" color="#fff" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}



// also shows the Out of Credits
// popup while in the chat interface when limit exhaust