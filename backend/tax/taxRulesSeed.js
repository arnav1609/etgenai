/**
 * taxRulesSeed.js
 * Seeds the FY 2025-26 tax rule config into MongoDB if it doesn't already exist.
 * Run with: node backend/tax/taxRulesSeed.js
 * Or called programmatically on server start.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import TaxRuleConfig from "../models/TaxRuleConfig.js";

export const FY2025_26_RULES = {
  financialYear: "2025-26",
  assessmentYear: "2026-27",
  isActive: true,

  newRegime: {
    standardDeduction: 75000,
    slabs: [
      { from: 0,        to: 400000,   rate: 0.00 },
      { from: 400000,   to: 800000,   rate: 0.05 },
      { from: 800000,   to: 1200000,  rate: 0.10 },
      { from: 1200000,  to: 1600000,  rate: 0.15 },
      { from: 1600000,  to: 2000000,  rate: 0.20 },
      { from: 2000000,  to: 2400000,  rate: 0.25 },
      { from: 2400000,  to: null,     rate: 0.30 },
    ],
    rebate87A: {
      maxTaxableIncome: 1200000,
      maxRebate: 60000,
    },
  },

  oldRegime: {
    standardDeduction: 50000,
    slabs: {
      below60: [
        { from: 0,        to: 250000,   rate: 0.00 },
        { from: 250000,   to: 500000,   rate: 0.05 },
        { from: 500000,   to: 1000000,  rate: 0.20 },
        { from: 1000000,  to: null,     rate: 0.30 },
      ],
      senior60to80: [
        { from: 0,        to: 300000,   rate: 0.00 },
        { from: 300000,   to: 500000,   rate: 0.05 },
        { from: 500000,   to: 1000000,  rate: 0.20 },
        { from: 1000000,  to: null,     rate: 0.30 },
      ],
      superSenior80plus: [
        { from: 0,        to: 500000,   rate: 0.00 },
        { from: 500000,   to: 1000000,  rate: 0.20 },
        { from: 1000000,  to: null,     rate: 0.30 },
      ],
    },
    rebate87A: {
      maxTaxableIncome: 500000,
      maxRebate: 12500,
    },
  },

  cess: {
    rate: 0.04,
    label: "Health & Education Cess",
  },

  surcharge: [
    { from: 5000000,   to: 9999999,   rate: 0.10 },
    { from: 10000000,  to: 19999999,  rate: 0.15 },
    { from: 20000000,  to: 49999999,  rate: 0.25 },
    { from: 50000000,  to: null,      rate: 0.37 },
  ],

  maxDeductions: {
    "80C": 150000,
    "80D_self": 25000,
    "80D_selfSenior": 50000,
    "80D_parents": 25000,
    "80D_parentsSenior": 50000,
    "80CCD1B": 50000,
    homeLoanInterest: 200000,
  },
};

export async function seedTaxRules() {
  try {
    const existing = await TaxRuleConfig.findOne({ financialYear: "2025-26" });
    if (existing) {
      console.log("✅ Tax rules for FY 2025-26 already exist.");
    } else {
      await TaxRuleConfig.create(FY2025_26_RULES);
      console.log("✅ Seeded FY 2025-26 tax rules.");
    }

    // Seed companion collections
    const { seedTaxClaimsCatalog } = await import("./taxClaimsCatalogSeed.js");
    await seedTaxClaimsCatalog();

    const { seedInternationalDutyRules } = await import("./internationalDutyRulesSeed.js");
    await seedInternationalDutyRules();
  } catch (err) {
    console.error("❌ Failed to seed tax rules:", err.message);
  }
}

// Standalone execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      await seedTaxRules();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
