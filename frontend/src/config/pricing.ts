/**
 * AskMentor — Frontend Centralized Pricing Configuration
 * =======================================================
 *
 * 🚨 THIS IS THE SINGLE SOURCE OF TRUTH FOR PRICING ON THE FRONTEND.
 *    All UI components (PricingConfig step, explore cards, paywall modals)
 *    consume this config — never hardcode prices or credits elsewhere.
 *
 *    When you update prices on the backend (backend/payments/pricing_config.py),
 *    update this file to match. In the future, this can be replaced with a
 *    single API call to GET /api/payments/tiers.
 */

// ---------------------------------------------------------------------------
// Credit Costs — must mirror backend/payments/pricing_config.py::CREDIT_COSTS
// ---------------------------------------------------------------------------

export const CREDIT_COSTS: Record<string, number> = {
  text_message: 1,
  deep_reasoning: 2,
  resume_analysis: 4,
  voice_session: 5,
  live_session: 8,
};

// ---------------------------------------------------------------------------
// Platform Economics
// ---------------------------------------------------------------------------

// Mentor revenue share — what % of each unlock goes to the mentor
export const MENTOR_REVENUE_SHARE = 0.70;   // 70%
export const PLATFORM_FEE_SHARE = 0.30;     // 30%

// Minimum wallet balance a mentor must accumulate before they can withdraw
export const MENTOR_WITHDRAWAL_THRESHOLD_INR = 500;    // ₹500 minimum payout

// Minimum and maximum amount a user can top-up their wallet in one transaction
export const USER_WALLET_MIN_TOPUP_INR = 29;   // ₹29 minimum deposit
export const USER_WALLET_MAX_TOPUP_INR = 5000; // ₹5000 maximum deposit

// ---------------------------------------------------------------------------
// Free Exploration Rules
// ---------------------------------------------------------------------------

export const FREE_EXPLORATION = {
  /** Max distinct mentors a user can try free per calendar month */
  maxMentorsPerMonth: 3,
  /** Free credits given on first interaction with a new mentor */
  freeCreditsPerMentor: 2,
  /** Whether voice requires unlock even on free trial */
  voiceRequiresUnlock: true,
};

// ---------------------------------------------------------------------------
// Pricing Tiers
// ---------------------------------------------------------------------------

export interface PricingTier {
  tierId: string;
  displayName: string;
  unlockPrice: number;       // Default recommended price in ₹
  credits: number;           // Credits granted on unlock
  expiryDays: number;
  voiceEligible: boolean;
  minPrice: number;
  maxPrice: number;
  /** ±20% tolerance for credits customization */
  creditTolerance: number;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
  starter: {
    tierId: "starter",
    displayName: "Starter Access",
    unlockPrice: 29,
    credits: 60,
    expiryDays: 7,
    voiceEligible: false,
    minPrice: 29,
    maxPrice: 49,
    creditTolerance: 0.2,
  },
  standard: {
    tierId: "standard",
    displayName: "Standard Access",
    unlockPrice: 49,
    credits: 120,
    expiryDays: 14,
    voiceEligible: false,
    minPrice: 49,
    maxPrice: 149,
    creditTolerance: 0.2,
  },
  premium: {
    tierId: "premium",
    displayName: "Premium Access",
    unlockPrice: 99,
    credits: 240,
    expiryDays: 30,
    voiceEligible: true,
    minPrice: 99,
    maxPrice: 499,
    creditTolerance: 0.2,
  },
};

export const PRICING_TIERS_LIST = Object.values(PRICING_TIERS);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the allowed [min, max] credit range for a tier (±20%) */
export function getAllowedCreditRange(tierId: string): [number, number] {
  const tier = PRICING_TIERS[tierId];
  if (!tier) throw new Error(`Unknown tier: ${tierId}`);
  const delta = Math.floor(tier.credits * tier.creditTolerance);
  return [Math.max(1, tier.credits - delta), tier.credits + delta];
}

/** Returns the value score warning if price-per-credit is too high */
export function getValueScoreWarning(price: number, credits: number): string | null {
  const score = price / credits;
  if (score > 10) {
    return `⚠️ ₹${price} / ${credits} credits (₹${score.toFixed(1)}/credit) may reduce discoverability.`;
  }
  return null;
}

/** Validate a mentor's pricing configuration on the frontend before submit */
export function validatePricing(
  tierId: string,
  price: number,
  credits: number,
): { valid: boolean; error?: string } {
  const tier = PRICING_TIERS[tierId];
  if (!tier) return { valid: false, error: `Invalid tier: ${tierId}` };

  if (price < tier.minPrice || price > tier.maxPrice) {
    return {
      valid: false,
      error: `Price ₹${price} must be between ₹${tier.minPrice}–₹${tier.maxPrice} for ${tier.displayName}.`,
    };
  }

  const [minCredits, maxCredits] = getAllowedCreditRange(tierId);
  if (credits < minCredits || credits > maxCredits) {
    return {
      valid: false,
      error: `Credits (${credits}) must be between ${minCredits}–${maxCredits} for ${tier.displayName} (±20%).`,
    };
  }

  const score = price / credits;
  if (score < 0.3) {
    return {
      valid: false,
      error: `Pricing rejected: ₹${price} / ${credits} credits is below the platform minimum.`,
    };
  }

  return { valid: true };
}
