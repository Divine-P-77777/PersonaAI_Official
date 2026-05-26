import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | AskMentor",
  description: "Sign in to AskMentor to continue your mentorship journey with AI-powered personas.",
  openGraph: {
    title: "Sign In | AskMentor",
    description: "Connect with your AI mentors and continue your learning journey.",
  },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
