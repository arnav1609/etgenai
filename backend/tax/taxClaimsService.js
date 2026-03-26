/**
 * taxClaimsService.js
 * Analyzes which claims a user has used, missed, and is ineligible for.
 * Returns structured buckets with per-claim tax impact estimates.
 */
import TaxClaimCatalog from "../models/TaxClaimCatalog.js";

/**
 * Determine the effective tax rate for estimating savings on an additional claim.
 * @param {number} taxableIncome  The user's taxable income
 * @param {string} regime
 */
function effectiveMarginalRate(taxableIncome, regime) {
  if (regime === "new") {
    if (taxableIncome <= 400000) return 0;
    if (taxableIncome <= 800000) return 0.05;
    if (taxableIncome <= 1200000) return 0.10;
    if (taxableIncome <= 1600000) return 0.15;
    if (taxableIncome <= 2000000) return 0.20;
    if (taxableIncome <= 2400000) return 0.25;
    return 0.30;
  }
  // old regime below60 simplification
  if (taxableIncome <= 250000) return 0;
  if (taxableIncome <= 500000) return 0.05;
  if (taxableIncome <= 1000000) return 0.20;
  return 0.30;
}

/**
 * Main service function.
 * @param {object} params
 * @param {string} params.regime  "new" | "old"
 * @param {string} params.ageCategory
 * @param {string} params.employmentType
 * @param {object} params.deductionInputs  Current deduction values from user
 * @param {number} params.taxableIncome
 * @returns {{ used: [], unused: [], ineligible: [], summary: {} }}
 */
export async function analyzeTaxClaims({ regime, ageCategory, employmentType, deductionInputs = {}, taxableIncome = 0 }) {
  const catalog = await TaxClaimCatalog.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

  const marginalRate = effectiveMarginalRate(taxableIncome, regime);

  const DEDUCTION_MAP = {
    "80C": deductionInputs.section80C || 0,
    "80D_SELF": deductionInputs.section80D_self || 0,
    "80D_PARENTS": deductionInputs.section80D_parents || 0,
    "80D_PREV_CHECK": 0,  // placeholder
    "80CCD1B": deductionInputs.section80CCD1B || 0,
    "SEC_24B": deductionInputs.homeLoanInterest || 0,
    "HRA": deductionInputs.hraExemption || 0,
    "LTA": deductionInputs.ltaExemption || 0,
    "80E": deductionInputs.educationLoanInterest || 0,
    "80G": deductionInputs.donations80G || 0,
    "80TTA": deductionInputs.savingsInterest || 0,
    "80TTB": ageCategory !== "below60" ? (deductionInputs.savingsInterest || 0) : 0,
    "STD_DED_NEW": regime === "new" ? 75000 : 0,
    "STD_DED_OLD": regime === "old" ? 50000 : 0,
    "87A_NEW": regime === "new" ? 1 : 0,  // presence flag
    "87A_OLD": regime === "old" ? 1 : 0,
  };

  const used = [];
  const unused = [];
  const ineligible = [];

  for (const claim of catalog) {
    // Regime eligibility check
    const regimeOk = claim.regime === "both"
      || (claim.regime === "old_only" && regime === "old")
      || (claim.regime === "new_only" && regime === "new");

    // Employment eligibility
    const empOk = claim.applicableEmployment.includes("all") || claim.applicableEmployment.includes(employmentType);

    // Age restriction check
    const ageOk =
      claim.ageRestriction === "none"
      || (claim.ageRestriction === "senior_self" && ageCategory !== "below60")
      || (claim.ageRestriction === "super_senior" && ageCategory === "superSenior80plus");

    if (!regimeOk || !empOk || !ageOk) {
      ineligible.push({
        ...claim,
        reason: !regimeOk
          ? `Not available under ${regime === "new" ? "new" : "old"} regime`
          : !empOk
          ? `Not applicable for your employment type`
          : `Age restriction — applies only to ${claim.ageRestriction}`,
      });
      continue;
    }

    const currentValue = DEDUCTION_MAP[claim.code] || 0;
    const maxLimit = claim.maxLimit;
    const fullyUsed = maxLimit !== null && currentValue >= maxLimit;
    const potentialAdditional = maxLimit !== null ? Math.max(0, maxLimit - currentValue) : null;
    const estimatedSaving = potentialAdditional !== null
      ? Math.round(potentialAdditional * (claim.estimatedTaxImpactRate || marginalRate) * 1.04)
      : null;

    const enriched = {
      ...claim,
      currentValue,
      potentialAdditional,
      estimatedSaving,
      marginalRate,
      fullyUsed,
    };

    if (currentValue > 0 || claim.category === "rebate") {
      used.push(enriched);
    } else {
      unused.push(enriched);
    }
  }

  const totalPotentialSaving = unused.reduce((s, c) => s + (c.estimatedSaving || 0), 0);
  const usedCount = used.length;
  const unusedCount = unused.length;

  return {
    used,
    unused,
    ineligible,
    summary: {
      usedCount,
      unusedCount,
      totalAvailableClaims: usedCount + unusedCount,
      estimatedAdditionalSaving: totalPotentialSaving,
      regime,
      ageCategory,
      employmentType,
    },
  };
}

/**
 * Return full claim catalog from DB.
 */
export async function getClaimCatalog(regime, employmentType, ageCategory) {
  const query = { isActive: true };
  return TaxClaimCatalog.find(query).sort({ sortOrder: 1 }).lean();
}
