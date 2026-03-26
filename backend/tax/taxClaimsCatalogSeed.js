/**
 * taxClaimsCatalogSeed.js
 * Seeds all Indian income-tax claim catalog entries into MongoDB.
 */
import TaxClaimCatalog from "../models/TaxClaimCatalog.js";

export const CLAIM_CATALOG = [
  // ── Standard Deductions ────────────────────────────────────────
  {
    code: "STD_DED_NEW",
    name: "Standard Deduction (New Regime)",
    description: "Flat ₹75,000 deduction from salary/pension income automatically applied under the new regime.",
    category: "deduction", regime: "new_only",
    maxLimit: 75000, maxLimitNote: "Applied automatically — no input required",
    applicableEmployment: ["salaried", "freelancer"],
    proofRequired: [],
    legalSection: "Section 16(ia)",
    estimatedTaxImpactRate: 0.05,
    helpText: "This is automatically applied when you select the new regime. No separate claim needed.",
    sortOrder: 1,
  },
  {
    code: "STD_DED_OLD",
    name: "Standard Deduction (Old Regime)",
    description: "Flat ₹50,000 deduction from salary/pension income under the old regime.",
    category: "deduction", regime: "old_only",
    maxLimit: 50000, maxLimitNote: "Applied automatically for salaried/pensioners",
    applicableEmployment: ["salaried", "freelancer"],
    proofRequired: [],
    legalSection: "Section 16(ia)",
    estimatedTaxImpactRate: 0.05,
    helpText: "Automatically applied for salaried employees and pensioners. No documents needed.",
    sortOrder: 2,
  },

  // ── Section 80C ───────────────────────────────────────────────
  {
    code: "80C",
    name: "Section 80C Investments",
    description: "Investments in ELSS, PPF, LIC, EPF, NSC, home loan principal, tuition fees, etc.",
    category: "deduction", regime: "old_only",
    maxLimit: 150000, maxLimitNote: "Combined limit across all 80C instruments",
    applicableEmployment: ["all"],
    proofRequired: ["Investment statements", "Policy receipts", "School fee receipts", "Loan repayment certificate"],
    legalSection: "Section 80C",
    estimatedTaxImpactRate: 0.30,
    helpText: "Most popular deduction. Includes ELSS mutual funds, PPF deposits, LIC premiums, home loan principal repayment, and school tuition fees.",
    sortOrder: 3,
  },

  // ── Section 80D ───────────────────────────────────────────────
  {
    code: "80D_SELF",
    name: "80D — Health Insurance (Self & Family)",
    description: "Premium paid for health insurance covering self, spouse, and children.",
    category: "deduction", regime: "old_only",
    maxLimit: 25000, maxLimitNote: "₹50,000 if self is a senior citizen",
    applicableEmployment: ["all"],
    proofRequired: ["Health insurance premium receipt or certificate"],
    legalSection: "Section 80D",
    estimatedTaxImpactRate: 0.30,
    helpText: "Premiums paid for you, your spouse and children. Limit increases to ₹50,000 if you are a senior citizen.",
    sortOrder: 4,
  },
  {
    code: "80D_PARENTS",
    name: "80D — Health Insurance (Parents)",
    description: "Premium paid for parents' health insurance — additional benefit over the self limit.",
    category: "deduction", regime: "old_only",
    maxLimit: 25000, maxLimitNote: "₹50,000 if parents are senior citizens",
    applicableEmployment: ["all"],
    proofRequired: ["Parents' health insurance premium receipt"],
    legalSection: "Section 80D",
    estimatedTaxImpactRate: 0.30,
    helpText: "Claim separately for parents — this is IN ADDITION to the 80D limit for self. If parents are senior citizens, the limit rises to ₹50,000.",
    sortOrder: 5,
  },
  {
    code: "80D_PREV_CHECK",
    name: "80D — Preventive Health Checkup",
    description: "Expenses for preventive health checkup for self and family.",
    category: "deduction", regime: "old_only",
    maxLimit: 5000, maxLimitNote: "Within the overall 80D limit",
    applicableEmployment: ["all"],
    proofRequired: ["Health checkup receipts"],
    legalSection: "Section 80D",
    estimatedTaxImpactRate: 0.30,
    helpText: "Costs for routine medical checkups — part of, not over and above, the 80D ceiling.",
    sortOrder: 6,
  },

  // ── NPS ───────────────────────────────────────────────────────
  {
    code: "80CCD1B",
    name: "80CCD(1B) — NPS Additional Contribution",
    description: "Self-contribution to National Pension System, over and above the 80C limit.",
    category: "deduction", regime: "old_only",
    maxLimit: 50000, maxLimitNote: "Additional ₹50,000 over 80C limit",
    applicableEmployment: ["all"],
    proofRequired: ["NPS transaction statement", "PRAN card details"],
    legalSection: "Section 80CCD(1B)",
    estimatedTaxImpactRate: 0.30,
    helpText: "This gives you up to ₹50,000 EXTRA deduction beyond the ₹1.5L 80C cap. Great if you have already maxed 80C.",
    sortOrder: 7,
  },

  // ── Home Loan ─────────────────────────────────────────────────
  {
    code: "SEC_24B",
    name: "Home Loan Interest — Section 24(b)",
    description: "Interest paid on home loan for self-occupied or let-out property.",
    category: "deduction", regime: "old_only",
    maxLimit: 200000, maxLimitNote: "₹2L for self-occupied; no limit for let-out property",
    applicableEmployment: ["all"],
    proofRequired: ["Home loan interest certificate from lender", "Property details"],
    legalSection: "Section 24(b)",
    estimatedTaxImpactRate: 0.30,
    helpText: "For self-occupied property: up to ₹2L deduction. For let-out property: no upper limit (can offset rental income).",
    sortOrder: 8,
  },

  // ── HRA ───────────────────────────────────────────────────────
  {
    code: "HRA",
    name: "HRA — House Rent Allowance",
    description: "Exemption on HRA received from employer for rent paid.",
    category: "exemption", regime: "old_only",
    maxLimit: null, maxLimitNote: "min(actual HRA, 50%/40% basic salary, rent - 10% salary)",
    applicableEmployment: ["salaried"],
    proofRequired: ["Rent receipts (monthly)", "Landlord PAN if annual rent > ₹1L"],
    legalSection: "Section 10(13A)",
    estimatedTaxImpactRate: 0.30,
    helpText: "The exemption is the MINIMUM of: (a) actual HRA received, (b) rent paid minus 10% of basic salary, (c) 50% of salary if metro city / 40% if non-metro.",
    sortOrder: 9,
  },

  // ── LTA ───────────────────────────────────────────────────────
  {
    code: "LTA",
    name: "LTA — Leave Travel Allowance",
    description: "Exemption on travel expenses for domestic trips within India.",
    category: "exemption", regime: "old_only",
    maxLimit: null, maxLimitNote: "Actual travel cost (air/rail), twice in 4-year block",
    applicableEmployment: ["salaried"],
    proofRequired: ["Travel tickets/boarding passes", "Hotel receipts (optional)", "LTA declaration to employer"],
    legalSection: "Section 10(5)",
    estimatedTaxImpactRate: 0.20,
    helpText: "Available twice in a 4-year block period. Only travel cost (not stay) is exempt. Allowed for self + family.",
    sortOrder: 10,
  },

  // ── Education Loan ────────────────────────────────────────────
  {
    code: "80E",
    name: "80E — Education Loan Interest",
    description: "Interest paid on loan taken for higher education (self or dependent).",
    category: "deduction", regime: "old_only",
    maxLimit: null, maxLimitNote: "No upper limit — full interest claimed for up to 8 years",
    applicableEmployment: ["all"],
    proofRequired: ["Interest certificate from lender", "Loan sanction letter"],
    legalSection: "Section 80E",
    estimatedTaxImpactRate: 0.20,
    helpText: "Only the interest component (not principal) is deductible. Available for 8 consecutive assessment years from repayment start.",
    sortOrder: 11,
  },

  // ── Donations ─────────────────────────────────────────────────
  {
    code: "80G",
    name: "80G — Donations to Approved Funds",
    description: "Donations to approved charitable organisations — 50% or 100% deduction.",
    category: "deduction", regime: "old_only",
    maxLimit: null, maxLimitNote: "Up to 10% of adjusted gross total income for certain funds",
    applicableEmployment: ["all"],
    proofRequired: ["Donation receipt with 80G registration number", "Organization's 80G certificate"],
    legalSection: "Section 80G",
    estimatedTaxImpactRate: 0.15,
    helpText: "Deduction rate is either 50% or 100% of the donation, depending on the organisation. PM Relief Fund donations get 100% deduction.",
    sortOrder: 12,
  },

  // ── Savings Account Interest ───────────────────────────────────
  {
    code: "80TTA",
    name: "80TTA — Savings Account Interest",
    description: "Interest earned in savings bank accounts is deductible (non-seniors).",
    category: "deduction", regime: "old_only",
    maxLimit: 10000,
    applicableEmployment: ["all"],
    ageRestriction: "none",
    proofRequired: ["Bank statement showing interest credited"],
    legalSection: "Section 80TTA",
    estimatedTaxImpactRate: 0.20,
    helpText: "Interest from savings accounts (not FD) up to ₹10,000 is exempt. Senior citizens should use 80TTB instead.",
    sortOrder: 13,
  },
  {
    code: "80TTB",
    name: "80TTB — Interest for Senior Citizens",
    description: "Interest from bank deposits (savings + FD) is deductible for senior citizens.",
    category: "deduction", regime: "old_only",
    maxLimit: 50000, ageRestriction: "senior_self",
    applicableEmployment: ["all"],
    proofRequired: ["Bank/NBFC/post office interest certificate"],
    legalSection: "Section 80TTB",
    estimatedTaxImpactRate: 0.20,
    helpText: "Available only to senior citizens (60+). Covers interest from savings, FDs, and post office deposits — up to ₹50,000.",
    sortOrder: 14,
  },

  // ── Section 87A Rebate ─────────────────────────────────────────
  {
    code: "87A_NEW",
    name: "Section 87A Rebate (New Regime)",
    description: "Full tax rebate if taxable income ≤ ₹12,00,000 under the new regime.",
    category: "rebate", regime: "new_only",
    maxLimit: 60000, maxLimitNote: "Rebate = actual tax, up to ₹60,000, if taxable income ≤ ₹12L",
    applicableEmployment: ["all"],
    proofRequired: [],
    legalSection: "Section 87A",
    estimatedTaxImpactRate: 1.0,
    helpText: "If your taxable income (after standard deduction) is ₹12L or below, you pay ZERO income tax under the new regime — the rebate wipes out the entire liability.",
    sortOrder: 0,
  },
  {
    code: "87A_OLD",
    name: "Section 87A Rebate (Old Regime)",
    description: "Full tax rebate if taxable income ≤ ₹5,00,000 under the old regime.",
    category: "rebate", regime: "old_only",
    maxLimit: 12500,
    applicableEmployment: ["all"],
    proofRequired: [],
    legalSection: "Section 87A",
    estimatedTaxImpactRate: 1.0,
    helpText: "Under the old regime, if taxable income is ₹5L or below, you pay no tax (rebate up to ₹12,500).",
    sortOrder: 0,
  },
];

export async function seedTaxClaimsCatalog() {
  try {
    const count = await TaxClaimCatalog.countDocuments();
    if (count >= CLAIM_CATALOG.length) {
      console.log("✅ Tax claims catalog already seeded.");
      return;
    }

    await TaxClaimCatalog.deleteMany({}); // clean slate for idempotency
    await TaxClaimCatalog.insertMany(CLAIM_CATALOG);
    console.log(`✅ Seeded ${CLAIM_CATALOG.length} tax claim catalog entries.`);
  } catch (err) {
    console.error("❌ Failed to seed tax claims catalog:", err.message);
  }
}
