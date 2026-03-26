/**
 * taxEngine.js  — Pure, deterministic Indian income-tax calculation engine
 * FY 2025-26 / AY 2026-27
 *
 * All functions are stateless and unit-testable.
 * The `rules` parameter is a TaxRuleConfig document from MongoDB.
 */

// ─────────────────────────────────────────────
// 1. GROSS INCOME
// ─────────────────────────────────────────────

/**
 * Aggregate all income heads into a single gross income figure.
 * Capital gains are carried through as-is (placeholder — full treatment later).
 *
 * @param {Object} inputs
 * @returns {number} grossIncome
 */
export function computeGrossIncome(inputs) {
  const {
    salaryIncome = 0,
    housePropertyIncome = 0,
    businessIncome = 0,
    capitalGains = 0,
    otherIncome = 0,
    exemptAllowances = 0,
  } = inputs;

  // House property income can be negative (self-occupied loss capped at 2L old regime)
  const grossBeforeExempt =
    Number(salaryIncome) +
    Number(housePropertyIncome) +
    Number(businessIncome) +
    Number(capitalGains) +
    Number(otherIncome);

  // Exempt allowances reduce gross (HRA, LTA already excluded at source)
  return Math.max(0, grossBeforeExempt - Number(exemptAllowances));
}

// ─────────────────────────────────────────────
// 2. STANDARD DEDUCTION
// ─────────────────────────────────────────────

/**
 * Standard deduction applies if employment type is salaried/freelancer.
 * New regime: ₹75,000. Old regime: ₹50,000.
 *
 * @param {string} regime "old" | "new"
 * @param {string} employmentType
 * @param {Object} rules  TaxRuleConfig document
 * @returns {number}
 */
export function computeStandardDeduction(regime, employmentType, rules) {
  const eligible = ["salaried", "freelancer"].includes(employmentType);
  if (!eligible) return 0;

  if (regime === "new") {
    return rules.newRegime?.standardDeduction ?? 75000;
  }
  return rules.oldRegime?.standardDeduction ?? 50000;
}

// ─────────────────────────────────────────────
// 3. OLD-REGIME DEDUCTIONS
// ─────────────────────────────────────────────

/**
 * Compute the total eligible deductions under the old regime.
 * Caps deductions at the limits in the rules config.
 *
 * @param {Object} deductionInputs
 * @param {string} ageCategory
 * @param {Object} rules
 * @returns {{ total: number, breakdown: Object }}
 */
export function computeEligibleDeductionsOldRegime(deductionInputs, ageCategory, rules) {
  const limits = rules.maxDeductions || {};
  const isSeniorSelf = ["senior60to80", "superSenior80plus"].includes(ageCategory);

  // Section 80C — max 1.5L
  const c80C = Math.min(
    Number(deductionInputs.section80C ?? 0),
    limits["80C"] ?? 150000
  );

  // Section 80D — self
  const d80D_selfLimit = isSeniorSelf
    ? (limits["80D_selfSenior"] ?? 50000)
    : (limits["80D_self"] ?? 25000);
  const c80D_self = Math.min(Number(deductionInputs.section80D_self ?? 0), d80D_selfLimit);

  // Section 80D — parents (we don't know parent age from form; use standard limit as default)
  const c80D_parents = Math.min(
    Number(deductionInputs.section80D_parents ?? 0),
    limits["80D_parents"] ?? 25000
  );

  // 80CCD(1B) — NPS additional — max 50k
  const c80CCD1B = Math.min(
    Number(deductionInputs.section80CCD1B ?? 0),
    limits["80CCD1B"] ?? 50000
  );

  // Home Loan Interest Sec 24(b) — max 2L self-occupied
  const homeLoanInt = Math.min(
    Number(deductionInputs.homeLoanInterest ?? 0),
    limits.homeLoanInterest ?? 200000
  );

  // HRA exemption (pre-computed and passed in)
  const hra = Math.max(0, Number(deductionInputs.hraExemption ?? 0));

  // LTA
  const lta = Math.max(0, Number(deductionInputs.ltaExemption ?? 0));

  // Other deductions (80TTA, 80G etc.)
  const other = Math.max(0, Number(deductionInputs.otherDeductions ?? 0));

  const total = c80C + c80D_self + c80D_parents + c80CCD1B + homeLoanInt + hra + lta + other;

  return {
    total,
    breakdown: {
      "80C": c80C,
      "80D_self": c80D_self,
      "80D_parents": c80D_parents,
      "80CCD1B": c80CCD1B,
      "homeLoanInterest": homeLoanInt,
      "hraExemption": hra,
      "ltaExemption": lta,
      "otherDeductions": other,
    },
  };
}

// ─────────────────────────────────────────────
// 4. TAXABLE INCOME
// ─────────────────────────────────────────────

/**
 * Taxable income = gross - standardDeduction - otherDeductions
 * Cannot be negative.
 *
 * @param {number} gross
 * @param {number} standardDeduction
 * @param {number} otherDeductions  (0 for new regime — no deductions allowed)
 * @returns {number}
 */
export function computeTaxableIncome(gross, standardDeduction, otherDeductions = 0) {
  return Math.max(0, gross - standardDeduction - otherDeductions);
}

// ─────────────────────────────────────────────
// 5. SLAB-WISE TAX COMPUTATION (generic)
// ─────────────────────────────────────────────

/**
 * Given an array of slabs and a taxable income, compute tax slab-by-slab.
 * Returns total base tax and a full breakdown for display.
 *
 * @param {Array}  slabs  array of { from, to, rate }
 * @param {number} taxableIncome
 * @returns {{ baseTax: number, breakdown: Array }}
 */
function computeSlabTax(slabs, taxableIncome) {
  let baseTax = 0;
  const breakdown = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.from) break;

    const upper = slab.to !== null ? slab.to : Infinity;
    const taxableInSlab = Math.min(taxableIncome, upper) - slab.from;

    if (taxableInSlab <= 0) continue;

    const taxForSlab = Math.round(taxableInSlab * slab.rate);
    baseTax += taxForSlab;

    breakdown.push({
      from: slab.from,
      to: slab.to,
      rate: slab.rate,
      taxableAmount: taxableInSlab,
      taxForSlab,
    });
  }

  return { baseTax: Math.round(baseTax), breakdown };
}

// ─────────────────────────────────────────────
// 6. NEW REGIME TAX
// ─────────────────────────────────────────────

/**
 * Compute income tax under the new regime (FY2025-26).
 *
 * @param {number} taxableIncome
 * @param {Object} rules
 * @returns {{ baseTax: number, breakdown: Array }}
 */
export function computeNewRegimeTax(taxableIncome, rules) {
  const slabs = rules.newRegime?.slabs ?? [];
  return computeSlabTax(slabs, taxableIncome);
}

// ─────────────────────────────────────────────
// 7. OLD REGIME TAX
// ─────────────────────────────────────────────

/**
 * Compute income tax under the old regime.
 * Slab set chosen based on age category.
 *
 * @param {number} taxableIncome
 * @param {string} ageCategory  "below60" | "senior60to80" | "superSenior80plus"
 * @param {Object} rules
 * @returns {{ baseTax: number, breakdown: Array }}
 */
export function computeOldRegimeTax(taxableIncome, ageCategory, rules) {
  const slabSets = rules.oldRegime?.slabs ?? {};
  const slabs = slabSets[ageCategory] ?? slabSets.below60 ?? [];
  return computeSlabTax(slabs, taxableIncome);
}

// ─────────────────────────────────────────────
// 8. REBATE 87A
// ─────────────────────────────────────────────

/**
 * Section 87A rebate.
 * If taxableIncome <= threshold, rebate = min(tax, maxRebate).
 *
 * New regime  2025-26: threshold ₹12L, rebate up to ₹60,000
 * Old regime          : threshold ₹5L,  rebate up to ₹12,500
 *
 * @param {number} baseTax
 * @param {number} taxableIncome
 * @param {Object} rebate87AConfig   { maxTaxableIncome, maxRebate }
 * @returns {number}  rebate amount
 */
export function applyRebate(baseTax, taxableIncome, rebate87AConfig) {
  if (!rebate87AConfig) return 0;
  const { maxTaxableIncome, maxRebate } = rebate87AConfig;

  if (taxableIncome <= maxTaxableIncome) {
    return Math.min(baseTax, maxRebate);
  }
  return 0;
}

// ─────────────────────────────────────────────
// 9. SURCHARGE
// ─────────────────────────────────────────────

/**
 * Surcharge is levied on income-tax (before cess) when gross income > ₹50L.
 * Uses marginal relief to avoid cliff-edge effect.
 *
 * @param {number} taxAfterRebate
 * @param {number} grossIncome
 * @param {Object} rules
 * @returns {number}  surcharge amount
 */
export function applySurcharge(taxAfterRebate, grossIncome, rules) {
  const surchargeSlabs = rules.surcharge ?? [];
  let surchargeRate = 0;

  for (const slab of surchargeSlabs) {
    const upper = slab.to !== null ? slab.to : Infinity;
    if (grossIncome >= slab.from && grossIncome <= upper) {
      surchargeRate = slab.rate;
      break;
    }
  }

  if (surchargeRate === 0) return 0;
  return Math.round(taxAfterRebate * surchargeRate);
}

// ─────────────────────────────────────────────
// 10. CESS
// ─────────────────────────────────────────────

/**
 * Health & Education Cess @ 4% on (tax + surcharge).
 *
 * @param {number} taxPlusSurcharge
 * @param {Object} rules
 * @returns {number}
 */
export function applyCess(taxPlusSurcharge, rules) {
  const rate = rules.cess?.rate ?? 0.04;
  return Math.round(taxPlusSurcharge * rate);
}

// ─────────────────────────────────────────────
// 11. FULL REGIME COMPUTATION (combines all steps)
// ─────────────────────────────────────────────

/**
 * Full computation for a single regime.
 *
 * @param {"old"|"new"} regime
 * @param {Object} inputs        { incomeInputs, deductionInputs, employmentType, ageCategory }
 * @param {Object} rules         TaxRuleConfig document
 * @returns {Object}             Full result object
 */
export function computeRegime(regime, inputs, rules) {
  const { incomeInputs, deductionInputs = {}, employmentType = "salaried", ageCategory = "below60" } = inputs;

  const grossIncome = computeGrossIncome(incomeInputs);
  const standardDed = computeStandardDeduction(regime, employmentType, rules);

  let totalDeductions = 0;
  let deductionBreakdown = {};

  if (regime === "old") {
    const { total, breakdown } = computeEligibleDeductionsOldRegime(deductionInputs, ageCategory, rules);
    totalDeductions = total;
    deductionBreakdown = breakdown;
  }
  // New regime: no deductions (other than standard deduction)

  const taxableIncome = computeTaxableIncome(grossIncome, standardDed, totalDeductions);

  const { baseTax, breakdown: slabBreakdown } =
    regime === "new"
      ? computeNewRegimeTax(taxableIncome, rules)
      : computeOldRegimeTax(taxableIncome, ageCategory, rules);

  const rebate87AConfig =
    regime === "new"
      ? rules.newRegime?.rebate87A
      : rules.oldRegime?.rebate87A;

  const rebate87A = applyRebate(baseTax, taxableIncome, rebate87AConfig);
  const taxAfterRebate = Math.max(0, baseTax - rebate87A);

  const surcharge = applySurcharge(taxAfterRebate, grossIncome, rules);
  const cess = applyCess(taxAfterRebate + surcharge, rules);
  const finalTax = taxAfterRebate + surcharge + cess;

  const effectiveRate = grossIncome > 0
    ? parseFloat(((finalTax / grossIncome) * 100).toFixed(2))
    : 0;

  return {
    regime,
    grossIncome,
    standardDeduction: standardDed,
    totalDeductions,
    deductionBreakdown,
    taxableIncome,
    slabBreakdown,
    baseTax,
    rebate87A,
    surcharge,
    cess,
    finalTax,
    effectiveRate,
  };
}

// ─────────────────────────────────────────────
// 12. COMPARE REGIMES
// ─────────────────────────────────────────────

/**
 * Compare new vs old regime results and return the recommended one.
 *
 * @param {Object} newResult   from computeRegime("new", ...)
 * @param {Object} oldResult   from computeRegime("old", ...)
 * @returns {{ recommended: "old"|"new", saving: number, reason: string }}
 */
export function compareRegimes(newResult, oldResult) {
  const diff = oldResult.finalTax - newResult.finalTax;

  if (newResult.finalTax === 0 && oldResult.finalTax === 0) {
    return {
      recommended: "new",
      saving: 0,
      reason: "Both regimes result in zero tax. New regime is simpler.",
    };
  }

  if (diff > 0) {
    return {
      recommended: "new",
      saving: diff,
      reason: `New regime is better by ₹${diff.toLocaleString("en-IN")}. Simpler with fewer deductions to track.`,
    };
  } else if (diff < 0) {
    return {
      recommended: "old",
      saving: Math.abs(diff),
      reason: `Old regime is better by ₹${Math.abs(diff).toLocaleString("en-IN")} due to your eligible deductions.`,
    };
  }

  return {
    recommended: "new",
    saving: 0,
    reason: "Both regimes result in the same tax. New regime is recommended for simplicity.",
  };
}

// ─────────────────────────────────────────────
// 13. MASTER CALCULATE FUNCTION (entry point)
// ─────────────────────────────────────────────

/**
 * Master calculation entry point — runs both regimes, compares, and returns a complete result object.
 *
 * @param {Object} payload
 * @param {Object} rules    TaxRuleConfig document
 * @returns {Object}        Full calculation result
 */
export function masterCalculate(payload, rules) {
  const {
    incomeInputs,
    deductionInputs,
    employmentType = "salaried",
    ageCategory = "below60",
    taxesPaid = {},
    selectedRegime = "autoCompare",
  } = payload;

  const inputs = { incomeInputs, deductionInputs, employmentType, ageCategory };

  const newResult = computeRegime("new", inputs, rules);
  const oldResult = computeRegime("old", inputs, rules);
  const comparison = compareRegimes(newResult, oldResult);

  const totalTaxPaid = (Number(taxesPaid.tdsPaid ?? 0) + Number(taxesPaid.advanceTaxPaid ?? 0));

  const primaryResult = comparison.recommended === "new" ? newResult : oldResult;
  const balanceDue = primaryResult.finalTax - totalTaxPaid;

  return {
    newRegimeResult: newResult,
    oldRegimeResult: oldResult,
    comparison,
    recommendedRegime: comparison.recommended,
    taxSavedByOptimalRegime: comparison.saving,
    totalTaxPaid,
    balanceDue,                                   // positive = due, negative = refund
    refundEstimate: balanceDue < 0 ? Math.abs(balanceDue) : 0,
    grossIncome: newResult.grossIncome,           // same in both
    financialYear: rules.financialYear,
    assessmentYear: rules.assessmentYear,
  };
}
