import type { Metadata } from 'next';
import { Wallet, Unlock, Mic, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'AskMentor Refund and Cancellation Policy — understand your rights for wallet top-ups and mentor unlocks.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 py-20 pt-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Last updated: May 2026
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4 text-gray-900">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            We want you to feel confident using AskMentor. This policy explains exactly when
            and how refunds are issued.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <CheckCircle className="w-8 h-8 text-emerald-500" />, title: 'Wallet Top-Ups', desc: 'Refundable within 7 days if no credits used' },
            { icon: <Unlock className="w-8 h-8 text-orange-500" />, title: 'Mentor Unlocks', desc: 'Non-refundable once first interaction happens' },
            { icon: <Mic className="w-8 h-8 text-indigo-500" />, title: 'Voice Sessions', desc: 'Non-refundable once session started' },
          ].map((card) => (
            <div key={card.title} className="p-6 rounded-2xl bg-white border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">{card.icon}</div>
              <p className="font-bold text-gray-900 text-lg">{card.title}</p>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <Section title="1. Wallet Top-Up Refunds">
          <p className="text-gray-600 leading-relaxed">
            If you deposit money into your AskMentor wallet and have <strong className="text-gray-900">not used any credits</strong>,
            you may request a full refund within <strong className="text-gray-900">7 days</strong> of the transaction.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            If you have partially used credits, a pro-rated refund for the unused portion may be
            issued at our discretion. Cashfree processing fees (if any) are non-refundable.
          </p>
        </Section>

        <Section title="2. Mentor Unlock Refunds">
          <p className="text-gray-600 leading-relaxed">
            When you unlock a mentor's bot, you receive a credit pack valid for a fixed duration.
            Refunds for mentor unlocks are subject to the following:
          </p>
          <div className="mt-6 space-y-4">
            <PolicyCard
              status="Eligible"
              color="emerald"
              title="Full refund if mentor bot was unavailable"
              desc="If the mentor's bot was in a broken or non-ready state at the time of unlock, we will issue a full refund to your wallet."
            />
            <PolicyCard
              status="Eligible"
              color="emerald"
              title="Refund if no interaction took place within 24 hours"
              desc="If you unlock a mentor but do not start any interaction within 24 hours, contact support for a refund review."
            />
            <PolicyCard
              status="Not Eligible"
              color="red"
              title="Non-refundable after first interaction"
              desc="Once you have sent at least one message to a mentor (even if the answer was unsatisfactory), the unlock is considered used and is non-refundable."
            />
            <PolicyCard
              status="Not Eligible"
              color="red"
              title="Expired access non-refundable"
              desc="Access that has expired (after 7/14/30 days per tier) is not eligible for refund regardless of credits remaining."
            />
          </div>
        </Section>

        <Section title="3. Voice Interaction Refunds">
          <p className="text-gray-600 leading-relaxed">
            Voice interactions (real-time audio sessions) consume 5 credits per turn and incur
            third-party TTS/voice API costs. Once a voice session turn has been processed,
            the credits are <strong className="text-gray-900">non-refundable</strong>.
          </p>
        </Section>

        <Section title="4. How to Request a Refund">
          <ol className="list-none space-y-4 text-gray-600">
            {[
              'Email refunds@askmentor.online with subject "Refund Request — [Order ID]"',
              'Include your registered email, the order ID from your billing page, and reason for refund',
              'Our team will respond within 2 business days',
              'Approved refunds are processed to your original payment method within 5–7 business days',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="5. Mentor Withdrawal Policy">
          <p className="text-gray-600 leading-relaxed">
            Mentor earnings accumulate in the AskMentor mentor wallet. Withdrawals are permitted
            once the balance reaches <strong className="text-gray-900">₹500 minimum</strong>.
            Withdrawal requests are processed within <strong className="text-gray-900">3–5 business days</strong> to
            the registered bank account. AskMentor does not charge withdrawal fees, but bank
            transfer charges may apply.
          </p>
        </Section>

        <Section title="6. Platform Revenue Share">
          <p className="text-gray-600 leading-relaxed">
            For every mentor unlock, <strong className="text-gray-900">70%</strong> of the unlock
            price goes to the mentor's wallet and <strong className="text-gray-900">30%</strong> is
            retained by AskMentor as platform service fee. This fee is non-refundable once the
            payment is verified.
          </p>
        </Section>

        <Section title="7. Disputes">
          <p className="text-gray-600 leading-relaxed">
            For unresolved disputes, contact{' '}
            <a href="mailto:support@askmentor.online" className="text-orange-600 font-medium hover:underline">
              support@askmentor.online
            </a>{' '}
            or raise a complaint via the Cashfree dispute portal. All disputes are governed
            by the laws of India, with jurisdiction in the courts of Bangalore, Karnataka.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-8">
      <h2 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-200">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function PolicyCard({
  status, color, title, desc,
}: { status: string; color: 'emerald' | 'red'; title: string; desc: string }) {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${color === 'emerald' ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {status}
        </span>
        <p className="font-bold text-gray-900 text-sm">{title}</p>
      </div>
      <p className="text-sm leading-relaxed mt-2" style={{ color: 'inherit' }}>{desc}</p>
    </div>
  );
}
