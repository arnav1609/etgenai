/**
 * taxRecommendationEngine.js
 * Generates personalised, human-friendly tax-saving insights.
 *
 * Each insight has: { type, message, savingHint, priority }
 * type: "savings" | "regime" | "deductions" | "nilTax" | "info"
 */

const INR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/**
 * Generate an array of insight objects from a masterCalculate result.
 *
 * @param {Object} calcResult   Output of masterCalculate()
 * @param {Object} payload      Original input payload (for deduction inputs)
 * @param {Object} rules        TaxRuleConfig document
 * @returns {Array}
 */
export function generateTaxSavingInsights(calcResult, payload, rules) {
  const insights = [];
  const {
    newRegimeResult,
    oldRegimeResult,
    comparison,
    recommendedRegime,
    balanceDue,
  } = calcResult;

  const maxDed = rules.maxDeductions || {};
  const ded = payload.deductionInputs || {};

  // ── 1. REGIME RECOMMENDATION ──────────────────────────────────
  if (newRegimeResult.finalTax === 0) {
    insights.push({
      type: "nilTax",
      priority: 1,
      title: "Zero Tax Payable!",
      message:
        "Great news — under the new regime, your tax liability is ₹0 due to the Section 87A rebate and standard deduction. No tax to pay this year.",
      savingHint: null,
    });
  } else if (recommendedRegime === "new" && comparison.saving > 0) {
    insights.push({
      type: "regime",
      priority: 1,
      title: `New Regime is better by ${INR(comparison.saving)}`,
      message: `Your current deductions are not high enough to offset the new regime's lower slabs. Switching to the new regime saves you ${INR(comparison.saving)} this year.`,
      savingHint: comparison.saving,
    });
  } else if (recommendedRegime === "old" && comparison.saving > 0) {
    insights.push({
      type: "regime",
      priority: 1,
      title: `Old Regime is better by ${INR(comparison.saving)}`,
      message: `Your eligible deductions are bringing your taxable income down significantly. Old regime saves you ${INR(comparison.saving)} this year. Keep maximising deductions.`,
      savingHint: comparison.saving,
    });
  } else {
    insights.push({
      type: "regime",
      priority: 3,
      title: "Both regimes are equal",
      message:
        "Your tax liability is the same under both regimes. New regime is recommended for its simplicity.",
      savingHint: 0,
    });
  }

  // ── 2. 80C UTILISATION ────────────────────────────────────────
  const used80C = Number(ded.section80C ?? 0);
  const max80C = maxDed["80C"] ?? 150000;
  const unused80C = max80C - Math.min(used80C, max80C);

  if (unused80C > 0 && unused80C >= 10000 && recommendedRegime === "old") {
    const potentialSaving = Math.round(unused80C * 0.20); // rough 20% bracket saving
    insights.push({
      type: "savings",
      priority: 2,
      title: `Utilise full 80C — save up to ${INR(potentialSaving)}`,
      message: `You've used ${INR(used80C)} of the ${INR(max80C)} 80C limit. You have ${INR(unused80C)} more room through options like ELSS mutual funds, PPF, life insurance premium, home loan principal, or children's school fees.`,
      savingHint: potentialSaving,
    });
  }

  // ── 3. 80D HEALTH INSURANCE ───────────────────────────────────
  const used80DSelf = Number(ded.section80D_self ?? 0);
  const max80DSelf = maxDed["80D_self"] ?? 25000;
  const unused80D = max80DSelf - Math.min(used80DSelf, max80DSelf);

  if (unused80D > 5000 && recommendedRegime === "old") {
    insights.push({
      type: "savings",
      priority: 3,
      title: `80D Health Insurance deduction unused`,
      message: `You can claim up to ${INR(max80DSelf)} under Section 80D for health insurance premiums for yourself and your family. You still have ${INR(unused80D)} of room available.`,
      savingHint: Math.round(unused80D * 0.20),
    });
  }

  // ── 4. NPS 80CCD(1B) ──────────────────────────────────────────
  const used80CCD = Number(ded.section80CCD1B ?? 0);
  const max80CCD = maxDed["80CCD1B"] ?? 50000;

  if (used80CCD < max80CCD && recommendedRegime === "old") {
    const unused = max80CCD - Math.min(used80CCD, max80CCD);
    insights.push({
      type: "savings",
      priority: 4,
      title: `NPS investment — additional ${INR(unused)} deduction available`,
      message: `Section 80CCD(1B) allows an extra ${INR(max80CCD)} deduction for NPS investments, over and above the 80C limit. You can still claim ${INR(unused)} more.`,
      savingHint: Math.round(unused * 0.20),
    });
  }

  // ── 5. HOME LOAN INTEREST ─────────────────────────────────────
  const usedHLI = Number(ded.homeLoanInterest ?? 0);
  if (usedHLI === 0 && recommendedRegime === "old") {
    insights.push({
      type: "info",
      priority: 5,
      title: "Home loan interest deduction available",
      message:
        "If you have a home loan on a self-occupied property, the interest component (up to ₹2,00,000) is deductible under Section 24(b) in the old regime.",
      savingHint: null,
    });
  }

  // ── 6. NEW REGIME SWITCH POTENTIAL ────────────────────────────
  if (recommendedRegime === "old" && comparison.saving > 0) {
    // Show how close new regime is — sometimes deductions are thin
    const oldDed = oldRegimeResult.totalDeductions + oldRegimeResult.standardDeduction;
    const breakEven = newRegimeResult.grossIncome * 0.25; // rough heuristic
    if (oldDed < breakEven) {
      insights.push({
        type: "info",
        priority: 6,
        title: "You're close to benefiting from the new regime",
        message: `If your deductions drop below ≈ ${INR(Math.round(breakEven))}, the new regime may become more beneficial. Review your investment portfolio annually.`,
        savingHint: null,
      });
    }
  }

  // ── 7. REFUND / BALANCE DUE ───────────────────────────────────
  if (balanceDue < 0) {
    insights.push({
      type: "info",
      priority: 7,
      title: `Refund estimated: ${INR(Math.abs(balanceDue))}`,
      message: `Your TDS/advance tax paid exceeds your final liability. You may be eligible for a refund of approximately ${INR(Math.abs(balanceDue))} — file your ITR promptly to receive it.`,
      savingHint: null,
    });
  } else if (balanceDue > 10000) {
    insights.push({
      type: "info",
      priority: 7,
      title: `Tax due: ${INR(balanceDue)}`,
      message: `After accounting for TDS and advance tax paid, you still owe approximately ${INR(balanceDue)}. Ensure advance tax instalments are paid by due dates to avoid interest under Sec 234B/234C.`,
      savingHint: null,
    });
  }

  // Sort by priority ascending
  return insights.sort((a, b) => a.priority - b.priority);
}
