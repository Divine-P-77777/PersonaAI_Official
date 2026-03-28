"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthBranding } from "@/components/auth/AuthBranding";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";

interface AuthLayoutProps {
  children: ReactNode;
  type: "signin" | "signup";
}

export function AuthLayout({ children, type }: AuthLayoutProps) {
  const isSignIn = type === "signin";
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // AUTH GUARD: Prevent logged-in users from seeing sign-in/sign-up
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="40" color="#f97316" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 md:px-8 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gray-50" />
      <div className="fixed -z-10 -top-32 -left-32 w-[600px] h-[600px] bg-orange-100/60 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed -z-10 -bottom-32 -right-32 w-[600px] h-[600px] bg-pink-100/60 blur-[150px] rounded-full pointer-events-none" />

      {/* Card - Premium Glassmorphism Container */}
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.06)] border border-white/50 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:h-[620px]">

          {/* Mobile: Standard Stack */}
          <div className="md:hidden w-full p-8 pt-12">
            {children}
          </div>

          {/* Desktop: Advanced "Walking Gates" Slider */}
          <div className="hidden md:flex relative w-full h-full">
            
            {/* Panel 1: FORM Side */}
            <motion.div
                initial={false}
                animate={{ 
                    x: isSignIn ? "0%" : "100%",
                    zIndex: isSignIn ? 20 : 10
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.32, 0.72, 0, 1] // Custom "walking" curve
                }}
                className="absolute top-0 left-0 w-1/2 h-full bg-white flex items-center justify-center p-12 overflow-hidden"
            >
                <div className="w-full max-w-sm">
                    {children}
                </div>
            </motion.div>

            {/* Panel 2: BRANDING Side */}
            <motion.div
                initial={false}
                animate={{ 
                    x: isSignIn ? "100%" : "0%",
                    zIndex: isSignIn ? 10 : 20
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.32, 0.72, 0, 1] // Matching "walking" curve
                }}
                className="absolute top-0 left-0 w-1/2 h-full bg-gray-900 border-l border-white/10 overflow-hidden"
            >
                <AuthBranding type={type} />
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
