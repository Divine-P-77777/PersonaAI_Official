"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader } from "@/components/ui/Loader";

// Generates a gender-aware DiceBear avatar URL for a given first name
async function buildGenderAvatar(firstName: string): Promise<string> {
  const base = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`;
  try {
    const res = await fetch(`https://api.genderize.io/?name=${encodeURIComponent(firstName)}`);
    const data = await res.json();
    if (data.gender === "male") {
      return base + "&top=shortHair,shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar&facialHairProbability=40";
    } else if (data.gender === "female") {
      return base + "&top=longHair,bob,curly,curvy,straight01,straight02&facialHairProbability=0";
    }
  } catch { /* network error — fall through to generic */ }
  return base;
}

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
        localStorage.setItem("token", data.session.access_token);
        
        // Fetch the user's profile row
        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed, avatar_url, display_name")
          .eq("id", data.session.user.id)
          .single();

        // If this is a brand-new user with no avatar, assign a gender-smart cartoon one
        if (profile && !profile.avatar_url) {
          const rawName =
            profile.display_name ||
            data.session.user.user_metadata?.full_name ||
            data.session.user.email?.split("@")[0] ||
            "user";
          const firstName = rawName.split(" ")[0];
          const cartoonUrl = await buildGenderAvatar(firstName);

          // Persist the cartoon avatar so onboarding/profile show it immediately
          await supabase
            .from("users")
            .update({ avatar_url: cartoonUrl })
            .eq("id", data.session.user.id);
        }

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
