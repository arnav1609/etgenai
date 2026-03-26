import mongoose from "mongoose";

const userTaxProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  preferredRegime: { type: String, enum: ["old", "new", "autoCompare"], default: "autoCompare" },
  ageCategory: { type: String, enum: ["below60", "senior60to80", "superSenior80plus"], default: "below60" },
  employmentType: { type: String, enum: ["salaried", "selfEmployed", "freelancer", "business"], default: "salaried" },
  // Cache last calculation id for quick restore
  lastCalculationId: { type: mongoose.Schema.Types.ObjectId, ref: "TaxCalculation" },
}, { timestamps: true });

const UserTaxProfile = mongoose.model("UserTaxProfile", userTaxProfileSchema);
export default UserTaxProfile;
