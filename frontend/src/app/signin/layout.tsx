import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | PersonaBot",
  description: "Sign in to PersonaBot to continue your mentorship journey with AI-powered personas.",
  openGraph: {
    title: "Sign In | PersonaBot",
    description: "Connect with your AI mentors and continue your learning journey.",
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
