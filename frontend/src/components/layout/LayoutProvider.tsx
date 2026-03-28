"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";

interface LayoutProviderProps {
  children: React.ReactNode;
}

export default function LayoutProvider({ children }: LayoutProviderProps) {
  const pathname = usePathname();

  // Hide Navbar/Footer for the specialized bot management and chat interfaces
  const isDashboardDetail = pathname.startsWith("/dashboard/") && pathname !== "/dashboard";
  const isChat = pathname.startsWith("/chat");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuth = pathname.startsWith("/signin") || pathname.startsWith("/signup");

  const showHeaderFooter = !isDashboardDetail && !isChat && !isOnboarding && !isAuth;

  return (
    <>
      {showHeaderFooter && <Navbar />}
      <SmoothScroll>
        <main className="flex-grow">
          {children}
        </main>
      </SmoothScroll>
      {showHeaderFooter && <Footer />}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
