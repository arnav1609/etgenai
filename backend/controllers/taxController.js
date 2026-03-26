/**
 * taxController.js (Enhanced v2)
 * All handlers for /api/tax route namespace.
 */

import TaxCalculation from "../models/TaxCalculation.js";
import TaxRuleConfig from "../models/TaxRuleConfig.js";
import TaxClaimCatalog from "../models/TaxClaimCatalog.js";
import InternationalDutyRule from "../models/InternationalDutyRule.js";
import UserTaxProfile from "../models/UserTaxProfile.js";
import { masterCalculate } from "../tax/taxEngine.js";
import { generateTaxSavingInsights } from "../tax/taxRecommendationEngine.js";
import { analyzeTaxClaims, getClaimCatalog } from "../tax/taxClaimsService.js";
import { estimateAll } from "../tax/internationalDutyEngine.js";
import { FY2025_26_RULES } from "../tax/taxRulesSeed.js";

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function getActiveRules(financialYear = "2025-26") {
  try {
    const doc = await TaxRuleConfig.findOne({ financialYear, isActive: true }).lean();
    return doc ?? FY2025_26_RULES;
  } catch {
    return FY2025_26_RULES;
  }
}

function validatePayload(body) {
  const errors = [];
  const { incomeInputs } = body;
  if (!incomeInputs) { errors.push("incomeInputs is required"); return errors; }
  const gross =
    (Number(incomeInputs.salaryIncome) || 0) +
    (Number(incomeInputs.pensionIncome) || 0) +
    (Number(incomeInputs.housePropertyIncome) || 0) +
    (Number(incomeInputs.businessIncome) || 0) +
    (Number(incomeInputs.otherIncome) || 0) +
    (Number(incomeInputs.capitalGains) || 0) +
    (Number(incomeInputs.interestIncome) || 0) +
    (Number(incomeInputs.dividendIncome) || 0) -
    (Number(incomeInputs.exemptAllowances) || 0);
  if (gross < 0) errors.push("Gross income cannot be negative after exempt allowances");
  return errors;
}

function buildCalcResult(payload, rules) {
  const result = masterCalculate(payload, rules);
  const insights = generateTaxSavingInsights(result, payload, rules);
  return { result, insights };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tax/calculate
// ─────────────────────────────────────────────────────────────────────────────
export async function calculateTax(req, res) {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const rules = await getActiveRules(req.body.financialYear);
    const { result, insights } = buildCalcResult(req.body, rules);
    return res.json({ success: true, result, insights });
  } catch (err) {
    console.error("calculateTax:", err);
    return res.status(500).json({ message: "Calculation failed", error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tax/compare
// ─────────────────────────────────────────────────────────────────────────────
export async function compareRegimes(req, res) {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const rules = await getActiveRules(req.body.financialYear);
    const { result, insights } = buildCalcResult(req.body, rules);
    return res.json({
      success: true,
      newRegime: result.newRegimeResult,
      oldRegime: result.oldRegimeResult,
      comparison: result.comparison,
      recommendedRegime: result.recommendedRegime,
      taxSavedByOptimalRegime: result.taxSavedByOptimalRegime,
      insights,
    });
  } catch (err) {
    console.error("compareRegimes:", err);
    return res.status(500).json({ message: "Comparison failed", error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tax/save
// ─────────────────────────────────────────────────────────────────────────────
export async function saveCalculation(req, res) {
  try {
    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { financialYear = "2025-26", label, ageCategory = "below60", employmentType = "salaried", residentialStatus = "ordinary_resident" } = req.body;
    const rules = await getActiveRules(financialYear);
    const { result, insights } = buildCalcResult(req.body, rules);
    const userId = req.user?.id ?? null;

    const doc = await TaxCalculation.create({
      userId,
      financialYear,
      ageCategory,
      employmentType,
      residentialStatus,
      incomeInputs: req.body.incomeInputs,
      deductionInputs: req.body.deductionInputs ?? {},
      taxesPaid: req.body.taxesPaid ?? {},
      selectedRegime: req.body.selectedRegime ?? "autoCompare",
      grossIncome: result.grossIncome,
      recommendedRegime: result.recommendedRegime,
      newRegimeResult: result.newRegimeResult,
      oldRegimeResult: result.oldRegimeResult,
      taxSavedByOptimalRegime: result.taxSavedByOptimalRegime,
      balanceDue: result.balanceDue,
      refundEstimate: result.refundEstimate,
      recommendations: insights.map((i) => i.message),
      label: label || "My Tax Calculation",
      isSaved: true,
    });

    if (userId) {
      await UserTaxProfile.findOneAndUpdate(
        { userId },
        { lastCalculationId: doc._id, ageCategory, employmentType },
        { upsert: true, new: true }
      );
    }

    return res.status(201).json({ success: true, id: doc._id, result, insights });
  } catch (err) {
    console.error("saveCalculation:", err);
    return res.status(500).json({ message: "Save failed", error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tax/history/:userId
// ─────────────────────────────────────────────────────────────────────────────
export async function getHistory(req, res) {
  try {
    const requesterId = req.user?.id;
    const { userId } = req.params;
    if (String(requesterId) !== String(userId)) return res.status(403).json({ message: "Forbidden" });

    const history = await TaxCalculation.find({ userId, isSaved: true })
      .select("label financialYear selectedRegime recommendedRegime grossIncome newRegimeResult.finalTax oldRegimeResult.finalTax taxSavedByOptimalRegime balanceDue employmentType ageCategory createdAt")
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return res.json({ success: true, history });
  } catch (err) {
    console.error("getHistory:", err);
    return res.status(500).json({ message: "Failed to fetch history" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tax/calculation/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function getCalculation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const doc = await TaxCalculation.findById(id).lean();
    if (!doc) return res.status(404).json({ message: "Calculation not found" });
    if (doc.userId && String(doc.userId) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
    return res.json({ success: true, calculation: doc });
  } catch (err) {
    console.error("getCalculation:", err);
    return res.status(500).json({ message: "Failed to fetch calculation" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/tax/calculation/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function updateCalculation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const doc = await TaxCalculation.findById(id);
    if (!doc) return res.status(404).json({ message: "Calculation not found" });
    if (doc.userId && String(doc.userId) !== String(userId)) return res.status(403).json({ message: "Forbidden" });

    const errors = validatePayload(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const rules = await getActiveRules(doc.financialYear);
    const { result, insights } = buildCalcResult(req.body, rules);

    Object.assign(doc, {
      incomeInputs: req.body.incomeInputs,
      deductionInputs: req.body.deductionInputs ?? {},
      taxesPaid: req.body.taxesPaid ?? {},
      selectedRegime: req.body.selectedRegime ?? "autoCompare",
      grossIncome: result.grossIncome,
      recommendedRegime: result.recommendedRegime,
      newRegimeResult: result.newRegimeResult,
      oldRegimeResult: result.oldRegimeResult,
      taxSavedByOptimalRegime: result.taxSavedByOptimalRegime,
      balanceDue: result.balanceDue,
      refundEstimate: result.refundEstimate,
      recommendations: insights.map((i) => i.message),
      label: req.body.label || doc.label,
    });

    await doc.save();
    return res.json({ success: true, id: doc._id, result, insights });
  } catch (err) {
    console.error("updateCalculation:", err);
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/tax/calculation/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteCalculation(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const doc = await TaxCalculation.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (doc.userId && String(doc.userId) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
    await doc.deleteOne();
    return res.json({ success: true, message: "Calculation deleted" });
  } catch (err) {
    console.error("deleteCalculation:", err);
    return res.status(500).json({ message: "Delete failed" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tax/rules
// ─────────────────────────────────────────────────────────────────────────────
export async function getRules(req, res) {
  try {
    const rules = await getActiveRules(req.query.financialYear);
    return res.json({ success: true, rules });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch rules" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tax/claims/catalog
// ─────────────────────────────────────────────────────────────────────────────
export async function getClaimsCatalog(req, res) {
  try {
    const { regime, employmentType, ageCategory } = req.query;
    const catalog = await getClaimCatalog(regime, employmentType, ageCategory);
    return res.json({ success: true, catalog });
  } catch (err) {
    console.error("getClaimsCatalog:", err);
    return res.status(500).json({ message: "Failed to fetch claims catalog" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tax/claims/analyze
// ─────────────────────────────────────────────────────────────────────────────
export async function analyseClaims(req, res) {
  try {
    const { regime = "new", ageCategory = "below60", employmentType = "salaried", deductionInputs = {}, taxableIncome = 0 } = req.body;
    const analysis = await analyzeTaxClaims({ regime, ageCategory, employmentType, deductionInputs, taxableIncome });
    return res.json({ success: true, ...analysis });
  } catch (err) {
    console.error("analyseClaims:", err);
    return res.status(500).json({ message: "Claims analysis failed", error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tax/international-duty/rules
// ─────────────────────────────────────────────────────────────────────────────
export async function getInternationalDutyRules(req, res) {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    const rules = await InternationalDutyRule.find(query).sort({ category: 1 }).lean();
    return res.json({ success: true, rules });
  } catch (err) {
    console.error("getInternationalDutyRules:", err);
    return res.status(500).json({ message: "Failed to fetch duty rules" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tax/international-duty/estimate
// ─────────────────────────────────────────────────────────────────────────────
export async function estimateInternationalDuty(req, res) {
  try {
    const { items = [] } = req.body;
    if (!items.length) return res.status(400).json({ message: "items array is required" });
    const results = await estimateAll({ items });
    return res.json({ success: true, estimates: results, disclaimer: "These are estimates only. Actual duty/charges may vary. Verify with customs/FEMA guidelines." });
  } catch (err) {
    console.error("estimateInternationalDuty:", err);
    return res.status(500).json({ message: "Duty estimation failed", error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy compat: GET /api/tax/history/:userId  is handled above
// Legacy: POST /api/tax/save/:id [old path] → updateCalculation
// ─────────────────────────────────────────────────────────────────────────────
export { updateCalculation as updateSavedCalculation };
