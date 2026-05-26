import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://personabot.vercel.app'), // Replace with actual production URL
  title: {
    default: "AskMentor | Your AI Mentor",
    template: "%s | AskMentor"
  },
  description: "Connect with AI-powered personas of alumni, professors, and professionals.",
  keywords: ["AI Mentorship", "Student Guidance", "Digital Persona", "EdTech"],
  authors: [{ name: "AskMentor Team" }],
  creator: "AskMentor",
  publisher: "AskMentor",
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
    url: "https://personabot.vercel.app",
    siteName: "AskMentor",
    title: "AskMentor | Your AI Mentor",
    description: "Connect with AI-powered personas of alumni, professors, and professionals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AskMentor - Your AI Mentor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AskMentor | Your AI Mentor",
    description: "Connect with AI-powered personas of alumni, professors, and professionals.",
    images: ["/og-image.png"],
    creator: "@askmentor",
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
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased`}
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
