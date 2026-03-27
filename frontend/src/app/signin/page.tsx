"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { Loader } from "@/components/ui/Loader";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      showSuccess("Redirecting to Google...");
    } catch (err: any) {
      showError(err.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess("Welcome back!");
      window.location.href = "/auth/callback";
    } catch (err: any) {
      showError(err.message || "Invalid email or password.");
      setIsEmailLoading(false);
    }
  };

  return (
    <AuthLayout type="signin">
      <div className="space-y-4">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Landing</span>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Sign In</h1>
          <p className="text-gray-400 text-sm font-medium">Continue your mentorship journey.</p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full h-13 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-3 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 transition-all active:scale-[0.98] disabled:opacity-50 font-semibold text-gray-700"
        >
          {isGoogleLoading ? (
            <Loader size="22" color="#f97316" />
          ) : (
            <>
              <FcGoogle className="text-2xl flex-shrink-0" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-100" />
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-gray-100" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          {/* Email */}
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-13 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-4 text-gray-900 placeholder:text-gray-300 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-400 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-13 bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-12 text-gray-900 placeholder:text-gray-300 font-medium focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button type="button" className="text-sm text-gray-400 hover:text-orange-500 font-medium transition-colors">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isEmailLoading || !email || !password}
            className="w-full h-13 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            {isEmailLoading ? (
              <Loader size="22" color="white" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <p className="text-center text-sm text-gray-400 font-medium">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Create your Persona
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
