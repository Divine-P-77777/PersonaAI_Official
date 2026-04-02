import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account | PersonaBot",
  description: "Join PersonaBot to digitize your intellect or find your next mentor.",
  openGraph: {
    title: "Sign Up | PersonaBot",
    description: "Start your journey in the world's first network of professional AI personas.",
  },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
