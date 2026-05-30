"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Download, Share, PlusSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PWAPage() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20 mb-8 text-white">
            <Smartphone size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Install AskMentor App
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Get the full AskMentor experience directly on your device. Fast, reliable, and always just a tap away.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* iOS Instructions */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-6 text-gray-50 opacity-50 pointer-events-none group-hover:scale-110 transition-transform">
              <Smartphone size={80} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              iOS (Safari)
            </h2>
            <ol className="space-y-4 relative z-10 text-gray-600">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">1</div>
                <p className="mt-1">Open AskMentor in Safari on your iPhone or iPad.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">2</div>
                <p className="mt-1 flex items-center flex-wrap gap-2">
                  Tap the Share button 
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                    <Share size={16} className="text-blue-500" />
                  </span>
                  in the bottom navigation bar.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">3</div>
                <p className="mt-1 flex items-center flex-wrap gap-2">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                    <PlusSquare size={16} className="text-gray-900" />
                  </span>
                </p>
              </li>
            </ol>
          </div>

          {/* Android / Desktop Instructions */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-6 text-gray-50 opacity-50 pointer-events-none group-hover:scale-110 transition-transform">
              <Download size={80} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              Android & Desktop
            </h2>
            <ol className="space-y-4 relative z-10 text-gray-600">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">1</div>
                <p className="mt-1">Open AskMentor in Chrome, Edge, or Brave.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">2</div>
                <p className="mt-1 flex items-center flex-wrap gap-2">
                  Look for the Install prompt at the bottom of the screen, or tap the menu icon (three dots) in the browser.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">3</div>
                <p className="mt-1">
                  Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </li>
            </ol>
            {deferredPrompt && (
              <div className="mt-8 relative z-10">
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95 duration-300"
                >
                  <Download size={20} />
                  Install App Now
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center pt-8">
          <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95 duration-300">
            Back to Explore <ArrowRight size={20} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
