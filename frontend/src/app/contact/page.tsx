import type { Metadata } from 'next';
import { CreditCard, LifeBuoy, Shield, Scale, Handshake, Bug } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the AskMentor team for support, refunds, or partnership inquiries.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 py-20 pt-32">
          <h1 className="text-5xl font-black tracking-tight mb-4 text-gray-900">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            We typically respond within 1–2 business days. For urgent payment issues,
            use the dedicated refunds email.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: <CreditCard className="w-8 h-8 text-orange-500" />,
              title: 'Payment & Refund Issues',
              desc: 'Problems with wallet, transactions, or refund requests',
              email: 'refunds@askmentor.online',
              badge: 'Priority',
            },
            {
              icon: <LifeBuoy className="w-8 h-8 text-orange-500" />,
              title: 'General Support',
              desc: 'Account help, bot issues, or platform questions',
              email: 'support@askmentor.online',
              badge: null,
            },
            {
              icon: <Shield className="w-8 h-8 text-orange-500" />,
              title: 'Privacy & Data',
              desc: 'Data access requests, deletion, or DPDP Act inquiries',
              email: 'privacy@askmentor.online',
              badge: null,
            },
            {
              icon: <Scale className="w-8 h-8 text-orange-500" />,
              title: 'Legal & Compliance',
              desc: 'Terms violations, IP issues, or legal correspondence',
              email: 'legal@askmentor.online',
              badge: null,
            },
            {
              icon: <Handshake className="w-8 h-8 text-orange-500" />,
              title: 'Partnerships',
              desc: 'Institution onboarding, B2B deals, or API access',
              email: 'partnerships@askmentor.online',
              badge: null,
            },
            {
              icon: <Bug className="w-8 h-8 text-orange-500" />,
              title: 'Bug Reports',
              desc: 'Report technical bugs or security vulnerabilities',
              email: 'bugs@askmentor.online',
              badge: null,
            },
          ].map((contact) => (
            <a
              key={contact.email}
              href={`mailto:${contact.email}`}
              className="group p-6 rounded-3xl bg-white border border-gray-200 hover:shadow-xl hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 group-hover:scale-110 transition-transform">
                  {contact.icon}
                </div>
                {contact.badge && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                    {contact.badge}
                  </span>
                )}
              </div>
              <h2 className="font-bold text-gray-900 text-lg mb-1">{contact.title}</h2>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{contact.desc}</p>
              <p className="text-sm font-bold text-orange-600 group-hover:underline">{contact.email}</p>
            </a>
          ))}
        </div>

        {/* Business Details (required by RBI/payment gateway) */}
        <div className="mt-12 p-8 rounded-3xl bg-gray-50 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Business Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Business Name</p>
              <p className="text-gray-900 font-bold">AskMentor</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Country</p>
              <p className="text-gray-900 font-bold">India</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Support Email</p>
              <p className="text-orange-600 font-bold">support@askmentor.online</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Response Time</p>
              <p className="text-gray-900 font-bold">1–2 Business Days</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Payment Disputes</p>
              <p className="text-gray-900 font-bold">refunds@askmentor.online</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Website</p>
              <p className="text-gray-900 font-bold">www.askmentor.online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

