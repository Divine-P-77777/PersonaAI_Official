"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader } from "@/components/ui/Loader";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/signin?error=auth_failed");
        return;
      }

      if (data?.session) {
        // Store the access token for the custom ApiService
        localStorage.setItem("token", data.session.access_token);
        
        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/signin");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
      <Loader size="50" color="#f97316" />
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Finalizing Authentication</h2>
        <p className="text-gray-500 font-medium">Please wait while we set up your secure session.</p>
      </div>
    </div>
  );
}
