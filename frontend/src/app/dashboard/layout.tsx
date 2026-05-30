import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your AI personas, scale your expertise, and track mentorship sessions.",
  robots: {
    index: false, // Don't index the dashboard
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
