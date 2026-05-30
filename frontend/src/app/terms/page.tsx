import type { Metadata } from 'next';
import { ChevronRight, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'AskMentor Terms of Service — the rules that govern your use of our AI mentorship platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 py-20 pt-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Last updated: May 2026
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4 text-gray-900">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            By using AskMentor, you agree to these terms. Please read them carefully.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <Section title="1. About AskMentor">
          <p className="text-gray-600 leading-relaxed">
            AskMentor is an AI mentorship marketplace where alumni and professionals
            ("Mentors") create AI personas ("Bots") that students and learners ("Users")
            can interact with. AskMentor acts as a marketplace and technology platform —
            we do not provide professional advice and are not responsible for the accuracy
            of mentor-provided content.
          </p>
        </Section>

        <Section title="2. Account Registration">
          <p className="text-gray-600 leading-relaxed">
            You must be at least 13 years old to use AskMentor. By registering, you
            confirm that all information provided is accurate and current. You are
            responsible for maintaining the security of your account credentials.
          </p>
        </Section>

        <Section title="3. Mentor Responsibilities">
          <p className="text-gray-600 leading-relaxed">
            Mentors who create AI personas represent that:
          </p>
          <ul className="mt-4 space-y-3 text-gray-600">
            {[
              'All uploaded content (documents, text, links) is owned by them or they have rights to use it',
              'Persona information accurately reflects their real professional background',
              'Content does not violate intellectual property, privacy, or other laws',
              'Pricing is set within the platform-defined bands and is not misleading',
              'They will not attempt to manipulate the AI system to produce harmful outputs',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. User Responsibilities">
          <p className="text-gray-600 leading-relaxed">
            Users agree not to:
          </p>
          <ul className="mt-4 space-y-3 text-gray-600">
            {[
              'Use the platform for any illegal, fraudulent, or harmful purpose',
              'Attempt to reverse-engineer or extract training data from mentor bots',
              'Share account access with others or circumvent credit/access restrictions',
              'Submit abusive, threatening, or discriminatory content to mentor bots',
              'Automate interactions to manipulate credit systems or analytics',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="5. Payments, Credits & Wallet">
          <p className="text-gray-600 leading-relaxed">
            All payments are processed by <strong className="text-gray-900">Cashfree Payments</strong> (PCI-DSS compliant).
            Credits purchased or earned have no cash value and cannot be transferred between accounts.
            Wallet balances do not earn interest. AskMentor reserves the right to modify pricing
            bands with 30 days' notice.
          </p>
        </Section>

        <Section title="6. AI Disclaimer">
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-amber-800 font-bold">Important Notice</p>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm">
              AskMentor AI personas generate responses using large language models (LLMs).
              Responses may contain errors, outdated information, or hallucinations.
              Nothing provided by a mentor bot constitutes professional advice (legal,
              medical, financial, or otherwise). Always verify critical information
              from authoritative sources.
            </p>
          </div>
        </Section>

        <Section title="7. Intellectual Property">
          <p className="text-gray-600 leading-relaxed">
            Mentors retain ownership of their uploaded content. By uploading, you grant
            AskMentor a non-exclusive, royalty-free license to store and process that
            content for powering the AI persona. The AskMentor platform, codebase,
            brand, and UI are owned by AskMentor and may not be copied or redistributed.
          </p>
        </Section>

        <Section title="8. Termination">
          <p className="text-gray-600 leading-relaxed">
            AskMentor may suspend or terminate accounts that violate these Terms. Upon
            termination, unused wallet balances (that have not been spent or unlocked)
            may be refunded at our discretion after deducting applicable fees. Mentor
            earnings below the withdrawal threshold may be forfeited upon policy-violation
            termination.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p className="text-gray-600 leading-relaxed">
            To the maximum extent permitted by law, AskMentor's total liability for
            any claim arising from use of the platform is limited to the amount you
            paid to AskMentor in the 3 months preceding the claim. AskMentor is not
            liable for any indirect, incidental, or consequential damages.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p className="text-gray-600 leading-relaxed">
            These Terms are governed by the laws of India. Any disputes shall be resolved
            exclusively in the courts of Bangalore, Karnataka, India.
          </p>
        </Section>

        <Section title="11. Changes to Terms">
          <p className="text-gray-600 leading-relaxed">
            We may modify these Terms at any time. Continued use of AskMentor after
            changes constitutes acceptance. We will notify registered users of material
            changes via email.
          </p>
        </Section>

        <Section title="12. Contact">
          <p className="text-gray-600 leading-relaxed">
            For terms-related inquiries:{' '}
            <a href="mailto:legal@askmentor.online" className="text-orange-600 font-medium hover:underline">
              legal@askmentor.online
            </a>
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
