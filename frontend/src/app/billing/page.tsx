'use client';

import { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle, Plus,
  CreditCard, Clock, CheckCircle, XCircle, Mic, MessageSquare,
  AlertCircle, ChevronRight, RefreshCw, Brain, FileText, Check, Landmark, Timer
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { api } from '../../services/api';
import {
  USER_WALLET_MIN_TOPUP_INR,
  USER_WALLET_MAX_TOPUP_INR,
  MENTOR_WITHDRAWAL_THRESHOLD_INR,
  MENTOR_REVENUE_SHARE,
  CREDIT_COSTS,
} from '../../config/pricing';

// Types

interface WalletData {
  balance_paise: number;
  lifetime_topup_paise: number;
  lifetime_spend_paise: number;
}

interface MentorWalletData {
  pending_paise: number;
  total_earned_paise: number;
  total_withdrawn_paise: number;
}

interface WalletTxn {
  id: string;
  txn_type: string;
  amount_paise: number;
  description: string;
  reference_id: string;
  created_at: string;
  meta?: {
    bot_name?: string;
    mentor_name?: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const paise = (p: number) => `₹${(p / 100).toFixed(2)}`;
const txnColor = (type: string) =>
  ['topup', 'refund', 'mentor_earning'].includes(type) ? 'text-emerald-600' : 'text-red-600';
const txnSign = (type: string) =>
  ['topup', 'refund', 'mentor_earning'].includes(type) ? '+' : '−';
const txnIcon = (type: string) => {
  const map: Record<string, React.ReactNode> = {
    topup: <ArrowDownCircle className="w-4 h-4 text-emerald-500" />,
    unlock_spend: <CreditCard className="w-4 h-4 text-orange-500" />,
    mentor_earning: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    withdrawal: <ArrowUpCircle className="w-4 h-4 text-blue-500" />,
    refund: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    platform_fee: <AlertCircle className="w-4 h-4 text-gray-400" />,
    voice_interaction: <Mic className="w-4 h-4 text-purple-500" />,
    text_message: <MessageSquare className="w-4 h-4 text-blue-500" />,
  };
  return map[type] || <Clock className="w-4 h-4 text-gray-400" />;
};

// ---------------------------------------------------------------------------
// Billing Page
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const [userRole, setUserRole] = useState<'user' | 'alumni' | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [mentorWallet, setMentorWallet] = useState<MentorWalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState(99);
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [topupLoading, setTopupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [profileRes, walletRes, txnRes] = await Promise.allSettled([
        api.getCurrentUser(),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/wallet`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/wallet/transactions?limit=20`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).then(r => r.json()),
      ]);

      if (profileRes.status === 'fulfilled') {
        setUserRole((profileRes.value as any).role || 'user');
      }
      if (walletRes.status === 'fulfilled' && walletRes.value) {
        setWallet(walletRes.value.user_wallet || null);
        setMentorWallet(walletRes.value.mentor_wallet || null);
      }
      if (txnRes.status === 'fulfilled' && txnRes.value?.transactions) {
        setTransactions(txnRes.value.transactions);
      }
    } catch (err) {
      console.error('[Billing] Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (topupAmount < USER_WALLET_MIN_TOPUP_INR || topupAmount > USER_WALLET_MAX_TOPUP_INR) return;
    setTopupLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/wallet/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ amount_inr: topupAmount }),
      });
      const data = await res.json();

      if (data.payment_session_id && typeof window !== 'undefined' && (window as any).Cashfree) {
        const cf = (window as any).Cashfree({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox' });
        cf.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_self',
        });
      }
    } catch (err) {
      console.error('[Billing] Topup failed:', err);
    } finally {
      setTopupLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({}),
      });
      setShowWithdraw(false);
      loadBillingData();
    } catch (err) {
      console.error('[Billing] Withdraw failed:', err);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const canWithdraw = mentorWallet
    ? mentorWallet.pending_paise >= MENTOR_WITHDRAWAL_THRESHOLD_INR * 100
    : false;

  if (loading) return <BillingLoader />;

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Billing</h1>
            <p className="text-gray-500 mt-1">Manage your wallet, credits, and earnings</p>
          </div>
          <button
            onClick={loadBillingData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-sm text-gray-600 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100/50 rounded-2xl border border-gray-200 mb-8 w-fit">
          {['overview', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* User Wallet Card */}
            <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-gray-200 shadow-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl translate-x-16 -translate-y-16 opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
                    <Wallet className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Your Wallet</p>
                    <p className="text-sm text-gray-600">Add money → unlock mentors</p>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-5xl font-black tracking-tight text-gray-900">
                    {wallet ? paise(wallet.balance_paise) : '₹0.00'}
                  </p>
                  <p className="text-gray-500 font-medium mt-1">Available balance</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <StatBox label="Total Deposited" value={paise(wallet?.lifetime_topup_paise || 0)} />
                  <StatBox label="Total Spent" value={paise(wallet?.lifetime_spend_paise || 0)} />
                </div>

                <button
                  onClick={() => setShowTopup(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Money
                </button>
              </div>
            </div>

            {/* Mentor Wallet (only for alumni role) */}
            {userRole === 'alumni' && (
              <div className="relative overflow-hidden p-8 rounded-3xl bg-white border border-gray-200 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl translate-x-16 -translate-y-16 opacity-50" />
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Mentor Earnings</p>
                        <p className="text-sm text-gray-600">
                          You earn {Math.round(MENTOR_REVENUE_SHARE * 100)}% of each unlock
                        </p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-gray-500 font-medium">Min. withdrawal</p>
                      <p className="text-sm font-bold text-gray-900">₹{MENTOR_WITHDRAWAL_THRESHOLD_INR}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-5xl font-black tracking-tight text-gray-900">
                      {mentorWallet ? paise(mentorWallet.pending_paise) : '₹0.00'}
                    </p>
                    <p className="text-gray-500 font-medium mt-1">Available to withdraw</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <StatBox label="Total Earned" value={paise(mentorWallet?.total_earned_paise || 0)} />
                    <StatBox label="Total Withdrawn" value={paise(mentorWallet?.total_withdrawn_paise || 0)} />
                  </div>

                  {/* Withdrawal progress */}
                  {mentorWallet && (
                    <div className="mb-8">
                      <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                        <span>Withdrawal progress</span>
                        <span>{paise(mentorWallet.pending_paise)} / ₹{MENTOR_WITHDRAWAL_THRESHOLD_INR}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (mentorWallet.pending_paise / (MENTOR_WITHDRAWAL_THRESHOLD_INR * 100)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowWithdraw(true)}
                    disabled={!canWithdraw}
                    className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all ${canWithdraw
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      }`}
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    {canWithdraw ? 'Withdraw Earnings' : `Need ₹${MENTOR_WITHDRAWAL_THRESHOLD_INR} to withdraw`}
                  </button>
                </div>
              </div>
            )}

            {/* Credit Cost Reference */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-6">Credit Cost Reference</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { action: 'Text Message', cost: CREDIT_COSTS.text_message, icon: <MessageSquare className="w-6 h-6 text-blue-500" /> },
                  { action: 'Deep Reasoning', cost: CREDIT_COSTS.deep_reasoning, icon: <Brain className="w-6 h-6 text-purple-500" /> },
                  { action: 'Resume Analysis', cost: CREDIT_COSTS.resume_analysis, icon: <FileText className="w-6 h-6 text-orange-500" /> },
                  { action: 'Voice Interaction', cost: CREDIT_COSTS.voice_interaction, icon: <Mic className="w-6 h-6 text-emerald-500" /> },
                ].map((item) => (
                  <div key={item.action} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
                    <div className="flex justify-center mb-3 p-3 bg-gray-50 rounded-xl inline-block mx-auto">
                      {item.icon}
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{item.action}</p>
                    <p className="text-gray-900 font-black">{item.cost} credit{item.cost > 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm font-medium mb-6">Last 20 transactions across your wallet</p>
            {transactions.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-bold text-gray-900 text-lg">No transactions yet</p>
                <p className="text-gray-500 mt-2">Your wallet activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {txnIcon(txn.txn_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{txn.description || txn.txn_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`font-black text-lg ${txnColor(txn.txn_type)}`}>
                      {txnSign(txn.txn_type)}{paise(Math.abs(txn.amount_paise))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top-up Modal */}
      {showTopup && (
        <Modal title="Add Money to Wallet" onClose={() => setShowTopup(false)}>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-900 block mb-3">Select Amount</label>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[29, 49, 99, 199, 299, 499, 999, 1999].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopupAmount(amt)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${topupAmount === amt
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  min={USER_WALLET_MIN_TOPUP_INR}
                  max={USER_WALLET_MAX_TOPUP_INR}
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">
                Min ₹{USER_WALLET_MIN_TOPUP_INR} · Max ₹{USER_WALLET_MAX_TOPUP_INR}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-600 space-y-3">
              <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Powered by Cashfree (PCI-DSS secure)</div>
              <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Instantly credited to your wallet</div>
              <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> Refundable if unused within 7 days</div>
            </div>

            <button
              onClick={handleTopup}
              disabled={topupLoading || topupAmount < USER_WALLET_MIN_TOPUP_INR}
              className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {topupLoading ? 'Redirecting...' : `Add ₹${topupAmount} to Wallet`}
            </button>
          </div>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <Modal title="Withdraw Earnings" onClose={() => setShowWithdraw(false)}>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-emerald-700 font-bold uppercase tracking-wider text-sm mb-2">Available to withdraw</p>
              <p className="text-4xl font-black text-emerald-900">
                {paise(mentorWallet?.pending_paise || 0)}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-600 space-y-3">
              <div className="flex items-center gap-3"><Landmark className="w-4 h-4 text-gray-400" /> Transferred to your registered bank account</div>
              <div className="flex items-center gap-3"><Timer className="w-4 h-4 text-gray-400" /> Processing time: 3–5 business days</div>
              <div className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /> No withdrawal fees charged by AskMentor</div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading}
              className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50"
            >
              {withdrawLoading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-gray-900 font-black text-xl">{value}</p>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BillingLoader() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20">
      <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Loading billing data...</p>
    </div>
  );
}
