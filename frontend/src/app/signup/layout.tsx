import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account | AskMentor",
  description: "Join AskMentor to digitize your intellect or find your next mentor.",
  openGraph: {
    title: "Sign Up | AskMentor",
    description: "Start your journey in the world's first network of professional AI personas.",
  },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
