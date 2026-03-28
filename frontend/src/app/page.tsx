"use client"

import { Hero } from '@/components/home/Hero';
import { Features } from '@/components/home/Features';
import { HowItWorks } from '@/components/home/HowItWorks';
import { UseCases } from '@/components/home/UseCases';
import { CTA } from '@/components/home/CTA';
export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <CTA />
    </div>
  );
}
