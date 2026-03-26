/**
 * internationalDutyEngine.js
 * Pure estimation functions for customs duty, import IGST, LRS TCS, and forex charges.
 * Results are ESTIMATES only — always labelled as such in the UI.
 */
import InternationalDutyRule from "../models/InternationalDutyRule.js";

/**
 * Format a rupee amount for display.
 */
function fmt(n) {
  return Math.round(n).toLocaleString("en-IN");
}

// ─────────────────────────────────────────────
// Baggage Duty Estimator
// ─────────────────────────────────────────────
export async function estimateBaggageDuty({ totalValue, residentAbroad = false }) {
  const code = residentAbroad ? "BAGGAGE_RESIDENT_LONG" : "BAGGAGE_GENERAL";
  const rule = await InternationalDutyRule.findOne({ code }).lean();

  const freeAllowance = rule?.freeAllowance ?? 50000;
  const rate = rule?.rate ?? 0.35;

  const excess = Math.max(0, totalValue - freeAllowance);
  const dutyAmount = Math.round(excess * rate);

  return {
    type: "baggage",
    totalValue,
    freeAllowance,
    excessAmount: excess,
    dutyRate: rate,
    estimatedDuty: dutyAmount,
    notes: rule?.notes ?? "Estimate based on Baggage Rules. Actual customs assessment may vary.",
    legalReference: rule?.legalReference,
    isEstimate: true,
  };
}

// ─────────────────────────────────────────────
// LRS Remittance TCS Estimator
// ─────────────────────────────────────────────
export async function estimateRemittanceTCS({ amount, purpose = "general" }) {
  const code = purpose === "education" ? "LRS_EDUCATION_TCS" : "LRS_TCS";
  const rule = await InternationalDutyRule.findOne({ code }).lean();

  const threshold = rule?.threshold ?? 700000;
  const rate = rule?.rate ?? 0.20;
  const taxableAmount = Math.max(0, amount - threshold);
  const tcsAmount = Math.round(taxableAmount * rate);

  return {
    type: "remittance_tcs",
    totalAmount: amount,
    threshold,
    taxableAmount,
    tcsRate: rate,
    estimatedTCS: tcsAmount,
    creditable: true,
    notes: rule?.notes ?? "TCS can be adjusted against your final tax liability when filing ITR.",
    legalReference: rule?.legalReference,
    isEstimate: true,
  };
}

// ─────────────────────────────────────────────
// Overseas Tour Package TCS
// ─────────────────────────────────────────────
export async function estimateOverseasTourTCS({ packageAmount }) {
  const rule = await InternationalDutyRule.findOne({ code: "OVERSEAS_TOUR_TCS" }).lean();
  const rate = rule?.rate ?? 0.20;
  const tcsAmount = Math.round(packageAmount * rate);

  return {
    type: "overseas_tour_tcs",
    packageAmount,
    tcsRate: rate,
    estimatedTCS: tcsAmount,
    creditable: true,
    notes: rule?.notes ?? "TCS collected by tour operator. Credit available in ITR.",
    legalReference: rule?.legalReference ?? "Section 206C(1G)",
    isEstimate: true,
  };
}

// ─────────────────────────────────────────────
// Forex GST Estimator
// ─────────────────────────────────────────────
export async function estimateForexCharges({ amount }) {
  let rule;

  if (amount > 1000000) {
    rule = await InternationalDutyRule.findOne({ code: "FOREX_GST_HIGH" }).lean();
    const gst = Math.min(Math.round(amount * (rule?.rate ?? 0.001)), rule?.flatAmount ?? 1000);
    return { type: "forex_gst", amount, gstRate: rule?.rate, estimatedGST: gst, description: "GST at 0.1%, max ₹1,000", isEstimate: true };
  }

  if (amount > 100000) {
    rule = await InternationalDutyRule.findOne({ code: "FOREX_GST_MID" }).lean();
    const gst = Math.max(Math.min(Math.round(amount * (rule?.rate ?? 0.005)), 1000), 500);
    return { type: "forex_gst", amount, gstRate: rule?.rate, estimatedGST: gst, description: "GST at 0.5%, min ₹500 max ₹1,000", isEstimate: true };
  }

  rule = await InternationalDutyRule.findOne({ code: "FOREX_GST_LOW" }).lean();
  const gst = Math.max(Math.round(amount * (rule?.rate ?? 0.01)), rule?.flatAmount ?? 45);
  return { type: "forex_gst", amount, gstRate: rule?.rate, estimatedGST: gst, description: "GST at 1%, min ₹45", isEstimate: true };
}

// ─────────────────────────────────────────────
// Import Duty Estimator (general goods)
// ─────────────────────────────────────────────
export async function estimateImportDuty({ goodsCategory = "electronics", cifValue }) {
  const codeMap = {
    electronics: "IMPORT_ELECTRONICS",
    clothing:    "IMPORT_CLOTHING",
    footwear:    "IMPORT_FOOTWEAR",
    watches:     "IMPORT_WATCHES",
    jewellery:   "IMPORT_JEWELLERY",
    furniture:   "IMPORT_FURNITURE",
    cosmetics:   "IMPORT_COSMETICS",
    sports:      "IMPORT_SPORTS",
    toys:        "IMPORT_TOYS",
    food:        "IMPORT_FOOD",
    books:       "IMPORT_BOOKS",
    default:     "IMPORT_ELECTRONICS",
  };
  const code = codeMap[goodsCategory] || codeMap.default;
  const rule = await InternationalDutyRule.findOne({ code }).lean();
  const rate = rule?.rate ?? 0.42;
  const duty = Math.round(cifValue * rate);

  return {
    type: "import_duty",
    cifValue,
    goodsCategory,
    dutyRate: rate,
    estimatedDuty: duty,
    notes: rule?.notes ?? "Composite rate including customs duty + IGST. Verify with customs for exact HS code.",
    isEstimate: true,
  };
}

// ─────────────────────────────────────────────
// Master estimator — orchestrates per type
// ─────────────────────────────────────────────
export async function estimateAll({ items = [] }) {
  const results = [];

  for (const item of items) {
    switch (item.type) {
      case "baggage":
        results.push(await estimateBaggageDuty(item));
        break;
      case "remittance_tcs":
        results.push(await estimateRemittanceTCS(item));
        break;
      case "overseas_tour_tcs":
        results.push(await estimateOverseasTourTCS(item));
        break;
      case "forex_charges":
        results.push(await estimateForexCharges(item));
        break;
      case "import_duty":
        results.push(await estimateImportDuty(item));
        break;
    }
  }

  return results;
}
