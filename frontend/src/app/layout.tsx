import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://personabot.ai'), // Replace with actual production URL
  title: {
    default: "PersonaBot | Your AI Mentor",
    template: "%s | PersonaBot"
  },
  description: "Connect with AI-powered personas of alumni, professors, and professionals for personalized mentorship.",
  keywords: ["AI Mentor", "Career Guidance", "Expert Networking", "Persona Bot", "Educational AI"],
  authors: [{ name: "PersonaBot Team" }],
  creator: "PersonaBot",
  publisher: "PersonaBot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "TYc7oU50kCRvacQe4ygPnBN_v_-VT4Usuvd9xzw11VM",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://personabot.ai",
    siteName: "PersonaBot",
    title: "PersonaBot | Your AI Mentor",
    description: "Connect with AI-powered personas of alumni, professors, and professionals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PersonaBot - Your AI Mentor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PersonaBot | Your AI Mentor",
    description: "Connect with AI-powered personas of alumni, professors, and professionals.",
    images: ["/og-image.png"],
    creator: "@personabot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

import LayoutProvider from "@/components/layout/LayoutProvider";
import { PersonaOrganization, WebsiteStructuredData } from "@/components/seo/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PersonaOrganization />
        <WebsiteStructuredData />
        <LayoutProvider>
          {children}
        </LayoutProvider>

      </body>
    </html>
  );
}
