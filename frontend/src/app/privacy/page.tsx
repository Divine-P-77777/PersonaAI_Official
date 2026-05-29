import type { Metadata } from 'next';
import { Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'AskMentor Privacy Policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 py-20 pt-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Last updated: May 2026
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4 text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            At AskMentor, your privacy is fundamental to our mission. This policy explains
            what data we collect, why we collect it, and how we protect it.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <Section title="1. Information We Collect">
          <SubSection title="Account Information">
            When you register, we collect your name, email address, and profile picture (via
            Google OAuth). Alumni/mentors additionally provide professional background, work
            history, and educational details to power their AI persona.
          </SubSection>
          <SubSection title="Payment Information">
            Payments are processed securely by <strong className="text-gray-900">Cashfree Payments</strong>. AskMentor
            does not store your full card number or CVV. We store only transaction metadata:
            order IDs, amounts, and payment status. Bank details for mentor withdrawals are
            stored encrypted.
          </SubSection>
          <SubSection title="Usage Data">
            We collect chat messages, session durations, credit usage logs, and interaction
            patterns to improve AI response quality and detect abuse. Messages are stored
            encrypted at rest in Supabase (PostgreSQL).
          </SubSection>
          <SubSection title="Technical Data">
            IP addresses, browser type, device information, and access logs are collected
            automatically for security monitoring and rate-limiting.
          </SubSection>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-none space-y-3 text-gray-600">
            {[
              'Powering AI persona chat using your uploaded knowledge base (RAG pipeline)',
              'Processing payments and managing wallet balances via Cashfree',
              'Calculating mentor earnings and processing withdrawal requests',
              'Sending transactional emails (payment confirmations, withdrawal updates)',
              'Detecting and preventing fraud, abuse, and unauthorized access',
              'Improving model quality through anonymized usage analytics',
              'Complying with legal obligations under Indian law (IT Act 2000, DPDP Act 2023)',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Data Sharing">
          <p className="text-gray-600 leading-relaxed">
            We do <strong className="text-gray-900">not</strong> sell your personal data. We share
            data only with:
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'Supabase', role: 'Database & Authentication' },
              { name: 'Cashfree Payments', role: 'Payment Processing' },
              { name: 'Groq (LLM)', role: 'AI Response Generation' },
              { name: 'Nomic AI', role: 'Text Embeddings' },
              { name: 'ElevenLabs / Sarvam', role: 'Voice Synthesis' },
              { name: 'Cloudinary', role: 'Avatar Image Storage' },
            ].map((p) => (
              <div key={p.name} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <p className="font-bold text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-500 mt-1">{p.role}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="4. Data Retention">
          <p className="text-gray-600 leading-relaxed">
            Account data is retained until deletion request. Chat history is retained for
            12 months for context quality. Payment transaction records are retained for
            7 years as required by Indian tax law. Deleted accounts have personal data
            anonymized within 30 days.
          </p>
        </Section>

        <Section title="5. Your Rights (DPDP Act 2023)">
          <p className="text-gray-600 leading-relaxed mb-4">
            Under the Digital Personal Data Protection Act 2023, you have the right to:
          </p>
          <ul className="space-y-3 text-gray-600">
            {[
              'Access a copy of all personal data we hold about you',
              'Correct inaccurate or incomplete personal data',
              'Erase your data (right to be forgotten)',
              'Withdraw consent for data processing',
              'Nominate a person to exercise rights on your behalf',
            ].map((right, i) => (
              <li key={i} className="flex items-center gap-3">
                <ArrowRight className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {right}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-gray-500 text-sm">
            Submit requests to: <a href="mailto:privacy@askmentor.online" className="text-orange-600 font-medium hover:underline">privacy@askmentor.online</a>
          </p>
        </Section>

        <Section title="6. Cookies">
          <p className="text-gray-600 leading-relaxed">
            We use only essential cookies for authentication (Supabase JWT session) and
            security (CSRF protection). We do not use third-party tracking cookies or
            advertising cookies.
          </p>
        </Section>

        <Section title="7. Security">
          <p className="text-gray-600 leading-relaxed">
            Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Payment data is
            handled exclusively by Cashfree, which is PCI-DSS compliant. We conduct regular
            security audits and use rate limiting to prevent brute-force attacks.
          </p>
        </Section>

        <Section title="8. Contact">
          <p className="text-gray-600 leading-relaxed">
            For privacy concerns, contact our Data Protection Officer at{' '}
            <a href="mailto:privacy@askmentor.online" className="text-orange-600 font-medium hover:underline">
              privacy@askmentor.online
            </a>{' '}
            or write to: AskMentor, India.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-8 scroll-mt-20">
      <h2 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-200">
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
