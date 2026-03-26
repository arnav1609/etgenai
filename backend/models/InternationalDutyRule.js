import mongoose from "mongoose";

/**
 * InternationalDutyRule — configurable rules for customs, import, LRS/remittance TCS, and forex.
 * Kept separate from income-tax rules by design.
 */
const internationalDutyRuleSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["baggage", "import_duty", "remittance_tcs", "forex_charges", "overseas_tour_tcs", "luxury_goods_tcs"],
    required: true,
    index: true,
  },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  rate: { type: Number }, // fractional e.g. 0.20 for 20%
  flatAmount: { type: Number }, // where applicable
  threshold: { type: Number, default: null }, // amount above which rate kicks in
  freeAllowance: { type: Number, default: null }, // e.g. ₹50,000 baggage allowance
  notes: { type: String },
  applicableFrom: { type: String, default: "2024-25" }, // FY
  legalReference: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const InternationalDutyRule = mongoose.model("InternationalDutyRule", internationalDutyRuleSchema);
export default InternationalDutyRule;
