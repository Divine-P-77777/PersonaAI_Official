export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {children}
    </div>
  );
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Explore Experts",
  description: "Connect with hyper-realistic AI twins of industry leaders, alumni, professors, and professionals.",
  openGraph: {
    title: "Explore Experts | PersonaBot",
    description: "Connect with hyper-realistic AI twins of industry leaders.",
    images: ["/og-explore.png"],
  },
  twitter: {
    title: "Explore Experts | PersonaBot",
    description: "Connect with hyper-realistic AI twins of industry leaders.",
    images: ["/og-explore.png"],
  },
};