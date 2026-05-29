'use client';

import { useState } from 'react';
import { Zap, Mic, Star, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import {
  PRICING_TIERS_LIST,
  getAllowedCreditRange,
  getValueScoreWarning,
  validatePricing,
  FREE_EXPLORATION,
  type PricingTier,
} from '../../../config/pricing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PricingFormData {
  is_free: boolean;
  pricing_tier: string | null;
  unlock_price: number | null;
  credits_per_pack: number | null;
  voice_enabled: boolean;
  subscription_enabled: boolean;
}

interface PricingConfigProps {
  formData: PricingFormData;
  updateFormData: (data: Partial<PricingFormData>) => void;
}

// ---------------------------------------------------------------------------
// Tier Icons (decorative, per tier)
// ---------------------------------------------------------------------------
const TIER_ICONS: Record<string, React.ReactNode> = {
  starter:  <Zap className="w-5 h-5" />,
  standard: <Star className="w-5 h-5" />,
  premium:  <Mic className="w-5 h-5" />,
};

const TIER_COLORS: Record<string, string> = {
  starter:  'from-blue-500 to-cyan-400',
  standard: 'from-violet-500 to-purple-400',
  premium:  'from-orange-500 to-pink-500',
};

const TIER_BORDER: Record<string, string> = {
  starter:  'border-blue-400 ring-blue-100',
  standard: 'border-violet-400 ring-violet-100',
  premium:  'border-orange-400 ring-orange-100',
};

// ---------------------------------------------------------------------------
// PricingConfig Component
// ---------------------------------------------------------------------------

export function PricingConfig({ formData, updateFormData }: PricingConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [valueWarning, setValueWarning] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFreeToggle = (isFree: boolean) => {
    if (isFree) {
      updateFormData({
        is_free: true,
        pricing_tier: null,
        unlock_price: null,
        credits_per_pack: null,
        voice_enabled: false,
      });
      setValidationError(null);
      setValueWarning(null);
    } else {
      // Default to first tier
      const defaultTier = PRICING_TIERS_LIST[0];
      updateFormData({
        is_free: false,
        pricing_tier: defaultTier.tierId,
        unlock_price: defaultTier.unlockPrice,
        credits_per_pack: defaultTier.credits,
        voice_enabled: false,
      });
    }
  };

  const handleTierSelect = (tier: PricingTier) => {
    updateFormData({
      pricing_tier: tier.tierId,
      unlock_price: tier.unlockPrice,
      credits_per_pack: tier.credits,
      voice_enabled: tier.voiceEligible ? formData.voice_enabled : false,
    });
    setValidationError(null);
    setValueWarning(null);
  };

  const handlePriceChange = (price: number) => {
    if (!formData.pricing_tier) return;
    const credits = formData.credits_per_pack ?? PRICING_TIERS_LIST[0].credits;
    const { valid, error } = validatePricing(formData.pricing_tier, price, credits);
    setValidationError(valid ? null : (error ?? null));
    setValueWarning(getValueScoreWarning(price, credits));
    updateFormData({ unlock_price: price });
  };

  const handleCreditsChange = (credits: number) => {
    if (!formData.pricing_tier) return;
    const price = formData.unlock_price ?? PRICING_TIERS_LIST[0].unlockPrice;
    const { valid, error } = validatePricing(formData.pricing_tier, price, credits);
    setValidationError(valid ? null : (error ?? null));
    setValueWarning(getValueScoreWarning(price, credits));
    updateFormData({ credits_per_pack: credits });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const selectedTier = formData.pricing_tier
    ? PRICING_TIERS_LIST.find((t) => t.tierId === formData.pricing_tier)
    : null;

  const creditRange = selectedTier ? getAllowedCreditRange(selectedTier.tierId) : null;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Set Your Pricing
        </h2>
        <p className="mt-2 text-gray-500 font-medium">
          Choose how students access your AI persona. Free mentors get more exposure; paid mentors earn revenue.
        </p>
      </div>

      {/* Free Exploration Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-emerald-800">Free Discovery Built-In</p>
          <p className="text-emerald-700 mt-0.5">
            Every student gets <strong>{FREE_EXPLORATION.maxMentorsPerMonth} free mentor explorations/month</strong> with{' '}
            <strong>{FREE_EXPLORATION.freeCreditsPerMentor} free messages each</strong> — even on paid mentors.
            This drives discovery and unlocks.
          </p>
        </div>
      </div>

      {/* Free / Paid Toggle */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleFreeToggle(true)}
          className={`p-6 rounded-3xl border-2 text-left transition-all duration-200 ${
            formData.is_free
              ? 'border-emerald-400 bg-emerald-50 ring-4 ring-emerald-100 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="font-black text-gray-900">Free Mentor</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Open access — maximize reach and build your reputation.
          </p>
        </button>

        <button
          onClick={() => handleFreeToggle(false)}
          className={`p-6 rounded-3xl border-2 text-left transition-all duration-200 ${
            !formData.is_free
              ? 'border-orange-400 bg-orange-50 ring-4 ring-orange-100 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-orange-500" />
          </div>
          <p className="font-black text-gray-900">Paid Mentor</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Monetize your expertise with platform-managed pricing.
          </p>
        </button>
      </div>

      {/* Paid Tier Selection */}
      {!formData.is_free && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <h3 className="font-bold text-gray-800 text-lg">Select Your Tier</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRICING_TIERS_LIST.map((tier) => {
              const isSelected = formData.pricing_tier === tier.tierId;
              const gradient = TIER_COLORS[tier.tierId];
              const border = TIER_BORDER[tier.tierId];
              const icon = TIER_ICONS[tier.tierId];

              return (
                <button
                  key={tier.tierId}
                  onClick={() => handleTierSelect(tier)}
                  className={`relative p-5 rounded-3xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? `${border} ring-4 shadow-xl bg-white`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center mb-4`}>
                    {icon}
                  </div>

                  <p className="font-black text-gray-900">{tier.displayName}</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">₹{tier.unlockPrice}</p>
                  <p className="text-xs text-gray-500 font-medium">default price</p>

                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    <p>🎯 <strong>{tier.credits} credits</strong> on unlock</p>
                    <p>⏳ Valid for <strong>{tier.expiryDays} days</strong></p>
                    {tier.voiceEligible && (
                      <p>🎙️ <strong>Voice enabled</strong></p>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 font-medium">
                    Price band: ₹{tier.minPrice}–₹{tier.maxPrice}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Voice Toggle (only for premium tier) */}
          {selectedTier?.voiceEligible && (
            <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200">
              <div>
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-orange-500" />
                  Enable Voice Responses
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Students can receive TTS audio replies. Voice costs 5 credits per turn.
                </p>
              </div>
              <button
                onClick={() => updateFormData({ voice_enabled: !formData.voice_enabled })}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  formData.voice_enabled ? 'bg-orange-400' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                    formData.voice_enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Advanced Customization (±20%) */}
          {selectedTier && (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="font-bold text-gray-700 text-sm">
                  Advanced Customization <span className="text-gray-400 font-medium">(±20% allowed)</span>
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {showAdvanced && (
                <div className="p-5 space-y-5 animate-in fade-in duration-200">
                  {/* Price Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-700">Unlock Price</label>
                      <span className="text-sm font-black text-gray-900">
                        ₹{formData.unlock_price ?? selectedTier.unlockPrice}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={selectedTier.minPrice}
                      max={selectedTier.maxPrice}
                      value={formData.unlock_price ?? selectedTier.unlockPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-400"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>₹{selectedTier.minPrice}</span>
                      <span>₹{selectedTier.maxPrice}</span>
                    </div>
                  </div>

                  {/* Credits Slider */}
                  {creditRange && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-700">Credits per Unlock</label>
                        <span className="text-sm font-black text-gray-900">
                          {formData.credits_per_pack ?? selectedTier.credits} credits
                        </span>
                      </div>
                      <input
                        type="range"
                        min={creditRange[0]}
                        max={creditRange[1]}
                        value={formData.credits_per_pack ?? selectedTier.credits}
                        onChange={(e) => handleCreditsChange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-violet-400"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{creditRange[0]}</span>
                        <span>{creditRange[1]}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{validationError}</p>
            </div>
          )}

          {/* Value Score Warning */}
          {valueWarning && !validationError && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">{valueWarning}</p>
            </div>
          )}

          {/* Summary Card */}
          {selectedTier && !validationError && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                Your Pricing Summary
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black">₹{formData.unlock_price ?? selectedTier.unlockPrice}</p>
                  <p className="text-xs text-gray-400 mt-1">Unlock price</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{formData.credits_per_pack ?? selectedTier.credits}</p>
                  <p className="text-xs text-gray-400 mt-1">Credits</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{selectedTier.expiryDays}d</p>
                  <p className="text-xs text-gray-400 mt-1">Access duration</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
