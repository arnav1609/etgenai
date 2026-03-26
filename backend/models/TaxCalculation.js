import mongoose from "mongoose";

const incomeInputsSchema = new mongoose.Schema({
  salaryIncome: { type: Number, default: 0 },
  pensionIncome: { type: Number, default: 0 },      // new field
  housePropertyIncome: { type: Number, default: 0 },
  businessIncome: { type: Number, default: 0 },
  freelanceIncome: { type: Number, default: 0 },    // new field
  capitalGains: { type: Number, default: 0 },       // placeholder
  interestIncome: { type: Number, default: 0 },     // new field
  dividendIncome: { type: Number, default: 0 },     // new field
  foreignIncome: { type: Number, default: 0 },      // new field – marker
  otherIncome: { type: Number, default: 0 },
  exemptAllowances: { type: Number, default: 0 },
}, { _id: false });

const deductionInputsSchema = new mongoose.Schema({
  section80C: { type: Number, default: 0 },
  section80D_self: { type: Number, default: 0 },
  section80D_parents: { type: Number, default: 0 },
  section80CCD1B: { type: Number, default: 0 },
  homeLoanInterest: { type: Number, default: 0 },    // Sec 24(b)
  hraExemption: { type: Number, default: 0 },
  ltaExemption: { type: Number, default: 0 },
  educationLoanInterest: { type: Number, default: 0 }, // 80E
  donations80G: { type: Number, default: 0 },
  savingsInterest: { type: Number, default: 0 },     // 80TTA/80TTB
  otherDeductions: { type: Number, default: 0 },
}, { _id: false });

const slabBreakdownSchema = new mongoose.Schema({
  from: Number,
  to: { type: Number, default: null },
  rate: Number,
  taxableAmount: Number,
  taxForSlab: Number,
}, { _id: false });

const regimeResultSchema = new mongoose.Schema({
  regime: { type: String, enum: ["old", "new"] },
  standardDeduction: Number,
  totalDeductions: Number,
  taxableIncome: Number,
  slabBreakdown: [slabBreakdownSchema],
  baseTax: Number,
  surcharge: Number,
  rebate87A: Number,
  cess: Number,
  finalTax: Number,
  effectiveRate: Number, // percentage
}, { _id: false });

const taxCalculationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  profileId: { type: String }, // guest-mode identifier

  // User context
  financialYear: { type: String, default: "2025-26" },
  ageCategory: { type: String, enum: ["below60", "senior60to80", "superSenior80plus"], default: "below60" },
  employmentType: { type: String, enum: ["salaried", "selfEmployed", "freelancer", "business"], default: "salaried" },

  // Raw inputs
  incomeInputs: incomeInputsSchema,
  deductionInputs: deductionInputsSchema,
  taxesPaid: {
    tdsPaid: { type: Number, default: 0 },
    tcsPaid: { type: Number, default: 0 },          // new field
    advanceTaxPaid: { type: Number, default: 0 },
    selfAssessmentTax: { type: Number, default: 0 }, // new field
  },

  // Residential status — affects foreign income treatment
  residentialStatus: {
    type: String,
    enum: ["ordinary_resident", "non_ordinary_resident", "non_resident"],
    default: "ordinary_resident",
  },

  // Computed
  grossIncome: { type: Number },
  selectedRegime: { type: String, enum: ["old", "new", "autoCompare"], default: "autoCompare" },
  recommendedRegime: { type: String, enum: ["old", "new"] },

  newRegimeResult: regimeResultSchema,
  oldRegimeResult: regimeResultSchema,

  // Net outcome
  taxSavedByOptimalRegime: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },   // negative = refund
  refundEstimate: { type: Number, default: 0 },

  // Insights snap
  recommendations: [{ type: String }],

  // Meta
  label: { type: String, default: "My Tax Calculation" },
  isSaved: { type: Boolean, default: true },
}, { timestamps: true });

const TaxCalculation = mongoose.model("TaxCalculation", taxCalculationSchema);
export default TaxCalculation;
