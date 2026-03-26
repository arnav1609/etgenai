/**
 * taxUtils.js — Client-side helpers for Indian tax formatting and display
 */

// ─────────────────────────────────────────────
// Currency formatting
// ─────────────────────────────────────────────

/**
 * Format a number as Indian Rupee (₹12,34,567)
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

/**
 * Format large amounts in Indian lakh/crore shorthand
 * e.g.: ₹12.5L, ₹1.2Cr
 */
export function formatLakhCrore(amount) {
  const n = Number(amount);
  if (isNaN(n)) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Format a percentage to 2 decimal places
 */
export function formatPercent(rate) {
  return `${(Number(rate) * 100).toFixed(0)}%`;
}

// ─────────────────────────────────────────────
// Slab helpers for display
// ─────────────────────────────────────────────

export function getSlabLabel(taxableIncome) {
  const n = Number(taxableIncome);
  if (n <= 400000) return "Nil Slab (0%)";
  if (n <= 800000) return "5% Slab";
  if (n <= 1200000) return "10% Slab";
  if (n <= 1600000) return "15% Slab";
  if (n <= 2000000) return "20% Slab";
  if (n <= 2400000) return "25% Slab";
  return "30% Slab";
}

export function getEffectiveRateLabel(effectiveRate) {
  if (effectiveRate === 0) return "Nil";
  return `${effectiveRate.toFixed(2)}%`;
}

// ─────────────────────────────────────────────
// Client-side mini tax engine (for instant preview — mirrors server engine)
// Keeps UI responsive while server call is in flight
// ─────────────────────────────────────────────

const FY2526_RULES_CLIENT = {
  newRegime: {
    standardDeduction: 75000,
    slabs: [
      { from: 0, to: 400000, rate: 0 },
      { from: 400000, to: 800000, rate: 0.05 },
      { from: 800000, to: 1200000, rate: 0.10 },
      { from: 1200000, to: 1600000, rate: 0.15 },
      { from: 1600000, to: 2000000, rate: 0.20 },
      { from: 2000000, to: 2400000, rate: 0.25 },
      { from: 2400000, to: null, rate: 0.30 },
    ],
    rebate87A: { maxTaxableIncome: 1200000, maxRebate: 60000 },
  },
  oldRegime: {
    standardDeduction: 50000,
    slabs: {
      below60: [
        { from: 0, to: 250000, rate: 0 },
        { from: 250000, to: 500000, rate: 0.05 },
        { from: 500000, to: 1000000, rate: 0.20 },
        { from: 1000000, to: null, rate: 0.30 },
      ],
      senior60to80: [
        { from: 0, to: 300000, rate: 0 },
        { from: 300000, to: 500000, rate: 0.05 },
        { from: 500000, to: 1000000, rate: 0.20 },
        { from: 1000000, to: null, rate: 0.30 },
      ],
      superSenior80plus: [
        { from: 0, to: 500000, rate: 0 },
        { from: 500000, to: 1000000, rate: 0.20 },
        { from: 1000000, to: null, rate: 0.30 },
      ],
    },
    rebate87A: { maxTaxableIncome: 500000, maxRebate: 12500 },
  },
  cess: { rate: 0.04 },
};

function slabTax(slabs, income) {
  let tax = 0;
  for (const s of slabs) {
    if (income <= s.from) break;
    const upper = s.to !== null ? s.to : Infinity;
    tax += Math.min(income, upper - s.from > 0 ? upper : income) ;
    const taxable = Math.min(income, s.to ?? Infinity) - s.from;
    if (taxable > 0) tax += taxable * s.rate;
  }
  // Simpler loop:
  return slabs.reduce((acc, s) => {
    if (income <= s.from) return acc;
    const upper = s.to !== null ? s.to : Infinity;
    return acc + (Math.min(income, upper) - s.from) * s.rate;
  }, 0);
}

/**
 * Quick client-side estimate (not for display as final — use server result for saving).
 * @param {Object} form  Current form state
 * @returns {{ newTax: number, oldTax: number, recommended: string }}
 */
export function quickEstimate(form) {
  try {
    const R = FY2526_RULES_CLIENT;
    const gross =
      (Number(form.salaryIncome) || 0) +
      (Number(form.otherIncome) || 0) +
      (Number(form.businessIncome) || 0) -
      (Number(form.exemptAllowances) || 0);

    const isSalaried = ["salaried", "freelancer"].includes(form.employmentType || "salaried");

    // New Regime
    const newStd = isSalaried ? R.newRegime.standardDeduction : 0;
    const newTaxable = Math.max(0, gross - newStd);
    let newBase = Math.round(slabTax(R.newRegime.slabs, newTaxable));
    const newRebate87A = newTaxable <= R.newRegime.rebate87A.maxTaxableIncome
      ? Math.min(newBase, R.newRegime.rebate87A.maxRebate) : 0;
    newBase = Math.max(0, newBase - newRebate87A);
    const newFinal = Math.round(newBase * 1.04);

    // Old Regime
    const oldStd = isSalaried ? R.oldRegime.standardDeduction : 0;
    const totalDed =
      Math.min(Number(form.section80C) || 0, 150000) +
      Math.min(Number(form.section80D_self) || 0, 25000) +
      Math.min(Number(form.section80CCD1B) || 0, 50000) +
      Math.min(Number(form.homeLoanInterest) || 0, 200000) +
      (Number(form.hraExemption) || 0);
    const ageSlabs = R.oldRegime.slabs[form.ageCategory || "below60"];
    const oldTaxable = Math.max(0, gross - oldStd - totalDed);
    let oldBase = Math.round(slabTax(ageSlabs, oldTaxable));
    const oldRebate87A = oldTaxable <= R.oldRegime.rebate87A.maxTaxableIncome
      ? Math.min(oldBase, R.oldRegime.rebate87A.maxRebate) : 0;
    oldBase = Math.max(0, oldBase - oldRebate87A);
    const oldFinal = Math.round(oldBase * 1.04);

    return {
      gross,
      newTax: newFinal,
      oldTax: oldFinal,
      newTaxable,
      oldTaxable,
      recommended: newFinal <= oldFinal ? "new" : "old",
      saving: Math.abs(oldFinal - newFinal),
    };
  } catch {
    return { gross: 0, newTax: 0, oldTax: 0, recommended: "new", saving: 0 };
  }
}

// ─────────────────────────────────────────────
// Employment type labels
// ─────────────────────────────────────────────

export const EMPLOYMENT_TYPE_LABELS = {
  salaried: "Salaried",
  selfEmployed: "Self-Employed",
  freelancer: "Freelancer",
  business: "Business Owner",
};

export const AGE_CATEGORY_LABELS = {
  below60: "Below 60 years",
  senior60to80: "Senior Citizen (60–80 years)",
  superSenior80plus: "Super Senior Citizen (80+ years)",
};
