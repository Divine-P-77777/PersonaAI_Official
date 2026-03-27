"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthBranding } from "@/components/auth/AuthBranding";

interface AuthLayoutProps {
  children: ReactNode;
  type: "signin" | "signup";
}

// Direction: signin = 0 (form left, image right), signup = 1 (image left, form right)
const slideVariants = {
  // Entering from right (going to signup)
  enterFromRight: {
    x: "100%",
    opacity: 0,
  },
  // Entering from left (going back to signin)
  enterFromLeft: {
    x: "-100%",
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  // Exiting to left (going to signup pushes current out left)
  exitToLeft: {
    x: "-100%",
    opacity: 0,
  },
  // Exiting to right (going back to signin pushes current out right)
  exitToRight: {
    x: "100%",
    opacity: 0,
  },
};

export function AuthLayout({ children, type }: AuthLayoutProps) {
  const isSignIn = type === "signin";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 md:px-8 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gray-50" />
      <div className="fixed -z-10 -top-32 -left-32 w-[500px] h-[500px] bg-orange-100/60 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed -z-10 -bottom-32 -right-32 w-[500px] h-[500px] bg-pink-100/60 blur-[140px] rounded-full pointer-events-none" />

      {/* Card — fixed size, clips the sliding track inside */}
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl shadow-gray-300/40 overflow-hidden">
        <div className="flex flex-col md:flex-row md:h-[580px]">

          {/* ── SLIDER TRACK: wraps both [form | branding] or [branding | form] ── */}
          {/* On mobile: stack vertically — just show form */}
          {/* On desktop: slide the entire row using AnimatePresence */}

          {/* Mobile: plain form, no animation overhead */}
          <div className="md:hidden w-full p-8">
            {children}
          </div>

          {/* Desktop: full slider */}
          <div className="hidden md:block relative w-full h-full overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={isSignIn}>
              <motion.div
                key={type}
                custom={isSignIn}
                variants={{
                  initial: (signIn: boolean) => ({
                    x: signIn ? "-100%" : "100%",
                    opacity: 0.6,
                  }),
                  animate: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (signIn: boolean) => ({
                    x: signIn ? "100%" : "-100%",
                    opacity: 0.6,
                  }),
                }}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  duration: 0.65,
                  ease: [0.32, 0.72, 0, 1], // easeInOutCubic-like — buttery slider
                }}
                className="absolute inset-0 flex flex-row"
              >
                {/* Panel order flips on signup: [Branding | Form] vs [Form | Branding] */}
                {isSignIn ? (
                  <>
                    {/* Sign-in: Form LEFT, Branding RIGHT */}
                    <div className="w-1/2 h-full flex items-center justify-center p-10 bg-white">
                      <div className="w-full max-w-sm">{children}</div>
                    </div>
                    <div className="w-1/2 h-full">
                      <AuthBranding type={type} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Sign-up: Branding LEFT, Form RIGHT */}
                    <div className="w-1/2 h-full">
                      <AuthBranding type={type} />
                    </div>
                    <div className="w-1/2 h-full flex items-center justify-center p-10 bg-white">
                      <div className="w-full max-w-sm">{children}</div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
