"use client";

import Image from "next/image";
import { Sparkles, MessageCircle } from "lucide-react";

interface AuthBrandingProps {
  type: "signin" | "signup";
}

export function AuthBranding({ type }: AuthBrandingProps) {
  const isSignIn = type === "signin";

  return (
    <div className="relative w-full h-full bg-gray-900 flex items-center justify-center p-12 overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={
            isSignIn
              ? "https://images.unsplash.com/photo-1523240715632-d984bb4b9156?q=80&w=1200" // Students collaborating
              : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200" // Mentor smiling
          }
          alt="Mentorship Branding"
          fill
          className="object-cover opacity-60 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-pink-600/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gray-900/40" />
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20 p-10 text-white shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="PersonaBot" className="w-10 h-10 object-contain" />
          <span className="font-bold text-2xl tracking-tight">PersonaBot</span>
        </div>

        <h2 className="text-3xl font-black mb-6 leading-tight">
          {isSignIn ? (
            <>
              Welcome back to your <span className="text-orange-400">AI Mentor</span> community.
            </>
          ) : (
            <>
              Join the future of <span className="text-pink-400">knowledge sharing</span>.
            </>
          )}
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed mb-10">
          Connect with elite AI personas of industry leaders and scale your own impact globally.
        </p>

        {/* Floating elements for visual interest */}
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white/20 bg-gray-800"
              />
            ))}
          </div>
          <div className="text-sm font-medium text-gray-400">
            Joined by 10k+ <br /> Mentors & Students
          </div>
        </div>
      </div>
    </div>
  );
}
