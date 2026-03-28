"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { supabase } from "@/lib/supabase";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/hooks/useToast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showError } = useToast();

  useEffect(() => {
    const checkRole = async () => {
      try {
        // 1. Check if we have a basic session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.replace("/signin");
          return;
        }

        // 2. Fetch profile from API to check DB role
        const profile = await api.getCurrentUser();
        
        if (profile.role === "alumni") {
          setIsAuthorized(true);
        } else {
          // Unauthorized role (usually 'user')
          showError("Only alumni can access the dashboard.");
          router.replace("/");
        }
      } catch (err) {
        console.error("Dashboard auth check failed:", err);
        router.replace("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">P</span>
                </div>
            </div>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Verifying Access...
        </p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
