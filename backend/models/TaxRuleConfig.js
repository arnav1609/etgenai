import mongoose from "mongoose";

const slabSchema = new mongoose.Schema({
  from: { type: Number, required: true },
  to: { type: Number, default: null }, // null = no upper bound
  rate: { type: Number, required: true },
}, { _id: false });

const rebateSchema = new mongoose.Schema({
  maxTaxableIncome: { type: Number, required: true },
  maxRebate: { type: Number, required: true },
}, { _id: false });

const surchargeSlabSchema = new mongoose.Schema({
  from: { type: Number, required: true },
  to: { type: Number, default: null },
  rate: { type: Number, required: true },
}, { _id: false });

const taxRuleConfigSchema = new mongoose.Schema({
  financialYear: { type: String, required: true, unique: true, index: true }, // e.g. "2025-26"
  assessmentYear: { type: String, required: true }, // e.g. "2026-27"
  isActive: { type: Boolean, default: true },

  newRegime: {
    standardDeduction: { type: Number, required: true }, // 75,000
    slabs: [slabSchema],
    rebate87A: rebateSchema,
  },

  oldRegime: {
    standardDeduction: { type: Number, required: true }, // 50,000
    slabs: {
      below60: [slabSchema],
      senior60to80: [slabSchema],
      superSenior80plus: [slabSchema],
    },
    rebate87A: rebateSchema,
  },

  cess: {
    rate: { type: Number, required: true }, // 0.04
    label: { type: String, default: "Health & Education Cess" },
  },

  surcharge: [surchargeSlabSchema],

  maxDeductions: {
    "80C": { type: Number, default: 150000 },
    "80D_self": { type: Number, default: 25000 },
    "80D_selfSenior": { type: Number, default: 50000 },
    "80D_parents": { type: Number, default: 25000 },
    "80D_parentsSenior": { type: Number, default: 50000 },
    "80CCD1B": { type: Number, default: 50000 },
    homeLoanInterest: { type: Number, default: 200000 },
  },
}, { timestamps: true });

const TaxRuleConfig = mongoose.model("TaxRuleConfig", taxRuleConfigSchema);
export default TaxRuleConfig;
