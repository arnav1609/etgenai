import mongoose from "mongoose";

/**
 * TaxClaimCatalog — one document per claimable deduction/exemption.
 * Loaded by the frontend to show what's available and what's been used.
 */
const taxClaimCatalogSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "80C", "HRA", "STD_DED"
  name: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ["deduction", "exemption", "rebate", "credit"],
    default: "deduction",
  },
  regime: {
    type: String,
    enum: ["old_only", "both", "new_only", "neither"],
    default: "old_only",
  },
  maxLimit: { type: Number, default: null }, // null = no fixed cap
  maxLimitNote: { type: String }, // e.g. "₹1.5L combined across all 80C instruments"
  applicableEmployment: {
    type: [String],
    enum: ["salaried", "selfEmployed", "freelancer", "business", "all"],
    default: ["all"],
  },
  proofRequired: { type: [String], default: [] }, // doc list for UI display
  ageRestriction: {
    type: String,
    enum: ["none", "senior_self", "super_senior"],
    default: "none",
  },
  legalSection: { type: String }, // "Section 80C"
  estimatedTaxImpactRate: { type: Number, default: 0.20 }, // rough saving per rupee claimed
  helpText: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 99 },
}, { timestamps: true });

const TaxClaimCatalog = mongoose.model("TaxClaimCatalog", taxClaimCatalogSchema);
export default TaxClaimCatalog;
