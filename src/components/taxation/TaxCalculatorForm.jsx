/**
 * TaxCalculatorForm.jsx
 * Multi-step smart tax calculator form matching NeuroFin design system.
 * Steps: Profile → Income → Deductions (old only) → Taxes Paid → Regime
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Info, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { EMPLOYMENT_TYPE_LABELS, AGE_CATEGORY_LABELS, quickEstimate, formatINR } from "../../utils/taxUtils";

// ─────────────────────────────────────────────
// Shared form atom
// ─────────────────────────────────────────────
const emptyDed = {
  section80C: "", section80D_self: "", section80D_parents: "",
  section80CCD1B: "", homeLoanInterest: "", hraExemption: "",
  ltaExemption: "", otherDeductions: "",
};

const defaultForm = {
  // Step 1
  ageCategory: "below60",
  employmentType: "salaried",
  selectedRegime: "autoCompare",
  // Step 2
  salaryIncome: "",
  housePropertyIncome: "",
  businessIncome: "",
  capitalGains: "",
  otherIncome: "",
  exemptAllowances: "",
  // Step 3 (old regime deductions)
  ...emptyDed,
  // Step 4
  tdsPaid: "",
  advanceTaxPaid: "",
};

// ─────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────
function Label({ children, hint }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-xs text-zinc-400 font-medium">{children}</span>
      {hint && (
        <div className="group relative cursor-help">
          <Info className="w-3 h-3 text-zinc-600" />
          <div className="absolute bottom-full left-0 mb-1.5 w-48 text-[10px] bg-[#1a1a1a] border border-white/10 text-zinc-300 px-2.5 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed">
            {hint}
          </div>
        </div>
      )}
    </div>
  );
}

function CurrencyInput({ name, value, onChange, placeholder = "₹ 0" }) {
  return (
    <input
      type="number"
      name={name}
      min="0"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function SelectInput({ name, value, onChange, options }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all appearance-none cursor-pointer"
    >
      {options.map(({ value: v, label }) => (
        <option key={v} value={v} className="bg-[#111] text-white">{label}</option>
      ))}
    </select>
  );
}

// ─────────────────────────────────────────────
// Steps
// ─────────────────────────────────────────────
function StepProfile({ form, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Age Category</Label>
        <SelectInput
          name="ageCategory"
          value={form.ageCategory}
          onChange={onChange}
          options={Object.entries(AGE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>
      <div>
        <Label>Employment Type</Label>
        <SelectInput
          name="employmentType"
          value={form.employmentType}
          onChange={onChange}
          options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </div>
      <div>
        <Label hint="Auto-compare calculates both and recommends the optimal regime">Tax Regime</Label>
        <SelectInput
          name="selectedRegime"
          value={form.selectedRegime}
          onChange={onChange}
          options={[
            { value: "autoCompare", label: "Auto-Compare (Recommended)" },
            { value: "new", label: "New Regime (FY 2025-26)" },
            { value: "old", label: "Old Regime" },
          ]}
        />
      </div>
    </div>
  );
}

function StepIncome({ form, onChange }) {
  const isSalaried = ["salaried", "freelancer"].includes(form.employmentType);
  return (
    <div className="space-y-4">
      {isSalaried && (
        <div>
          <Label hint="Total CTC / annual salary before any deductions">Salary Income</Label>
          <CurrencyInput name="salaryIncome" value={form.salaryIncome} onChange={onChange} />
        </div>
      )}
      {!isSalaried && (
        <div>
          <Label hint="Net profit / professional receipts for the year">Business / Professional Income</Label>
          <CurrencyInput name="businessIncome" value={form.businessIncome} onChange={onChange} />
        </div>
      )}
      <div>
        <Label hint="Rental income or loss from house property. Can be negative (loss).">
          House Property Income
        </Label>
        <CurrencyInput name="housePropertyIncome" value={form.housePropertyIncome} onChange={onChange} />
      </div>
      <div>
        <Label hint="Interest income, dividends, winnings, etc.">Other Income</Label>
        <CurrencyInput name="otherIncome" value={form.otherIncome} onChange={onChange} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label hint="Any exempt allowances already excluded from salary (e.g. LTA, HRA if choosing exemption route)">
            Exempt Allowances
          </Label>
          <CurrencyInput name="exemptAllowances" value={form.exemptAllowances} onChange={onChange} />
        </div>
        <div>
          <Label hint="Capital gains placeholder — complex provisions. Use for simple STCG/LTCG estimation only.">
            Capital Gains
          </Label>
          <CurrencyInput name="capitalGains" value={form.capitalGains} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function StepDeductions({ form, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 pb-1">These deductions apply only under the Old Regime.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label hint="PPF, ELSS, LIC premium, home loan principal, tuition fees etc. Max ₹1,50,000">
            Section 80C (max ₹1.5L)
          </Label>
          <CurrencyInput name="section80C" value={form.section80C} onChange={onChange} />
        </div>
        <div>
          <Label hint="Health insurance premium for self & family. Max ₹25,000 (₹50,000 for senior citizen self)">
            80D — Self & Family (max ₹25K)
          </Label>
          <CurrencyInput name="section80D_self" value={form.section80D_self} onChange={onChange} />
        </div>
        <div>
          <Label hint="Health insurance for parents. Max ₹25,000 (₹50,000 if parents are senior citizens)">
            80D — Parents (max ₹25K)
          </Label>
          <CurrencyInput name="section80D_parents" value={form.section80D_parents} onChange={onChange} />
        </div>
        <div>
          <Label hint="NPS contribution (employee) — additional deduction over 80C. Max ₹50,000">
            80CCD(1B) — NPS (max ₹50K)
          </Label>
          <CurrencyInput name="section80CCD1B" value={form.section80CCD1B} onChange={onChange} />
        </div>
        <div>
          <Label hint="Interest paid on home loan for self-occupied property. Max ₹2,00,000 under Sec 24(b)">
            Home Loan Interest — Sec 24(b) (max ₹2L)
          </Label>
          <CurrencyInput name="homeLoanInterest" value={form.homeLoanInterest} onChange={onChange} />
        </div>
        <div>
          <Label hint="HRA exemption (pre-calculated). Applies if you pay rent and are salaried.">
            HRA Exemption
          </Label>
          <CurrencyInput name="hraExemption" value={form.hraExemption} onChange={onChange} />
        </div>
        <div>
          <Label hint="Leave Travel Allowance — twice in 4 years block period">
            LTA (placeholder)
          </Label>
          <CurrencyInput name="ltaExemption" value={form.ltaExemption} onChange={onChange} />
        </div>
        <div>
          <Label hint="80TTA, 80G (donations), 80E (education loan interest), etc.">
            Other Deductions
          </Label>
          <CurrencyInput name="otherDeductions" value={form.otherDeductions} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function StepTaxesPaid({ form, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 pb-1">
        Enter taxes already paid to estimate your net liability or refund.
      </p>
      <div>
        <Label hint="Total TDS deducted by your employer or bank as shown in Form 26AS / AIS">
          TDS Deducted
        </Label>
        <CurrencyInput name="tdsPaid" value={form.tdsPaid} onChange={onChange} />
      </div>
      <div>
        <Label hint="Self-paid advance tax made during the financial year">Advance Tax Paid</Label>
        <CurrencyInput name="advanceTaxPaid" value={form.advanceTaxPaid} onChange={onChange} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const STEPS = ["Profile", "Income", "Deductions", "Taxes Paid"];

export default function TaxCalculatorForm({ onResult, loading }) {
  const [form, setForm] = useState(defaultForm);
  const [step, setStep] = useState(0);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [errors, setErrors] = useState({});

  const preview = quickEstimate(form);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validateStep(s) {
    const errs = {};
    if (s === 1) {
      const gross =
        (Number(form.salaryIncome) || 0) +
        (Number(form.businessIncome) || 0) +
        (Number(form.otherIncome) || 0);
      if (gross <= 0) errs.salaryIncome = "Enter at least one income source";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prevStep() { setStep((s) => Math.max(s - 1, 0)); }

  function buildPayload() {
    return {
      ageCategory: form.ageCategory,
      employmentType: form.employmentType,
      selectedRegime: form.selectedRegime,
      financialYear: "2025-26",
      incomeInputs: {
        salaryIncome: Number(form.salaryIncome) || 0,
        housePropertyIncome: Number(form.housePropertyIncome) || 0,
        businessIncome: Number(form.businessIncome) || 0,
        capitalGains: Number(form.capitalGains) || 0,
        otherIncome: Number(form.otherIncome) || 0,
        exemptAllowances: Number(form.exemptAllowances) || 0,
      },
      deductionInputs: {
        section80C: Number(form.section80C) || 0,
        section80D_self: Number(form.section80D_self) || 0,
        section80D_parents: Number(form.section80D_parents) || 0,
        section80CCD1B: Number(form.section80CCD1B) || 0,
        homeLoanInterest: Number(form.homeLoanInterest) || 0,
        hraExemption: Number(form.hraExemption) || 0,
        ltaExemption: Number(form.ltaExemption) || 0,
        otherDeductions: Number(form.otherDeductions) || 0,
      },
      taxesPaid: {
        tdsPaid: Number(form.tdsPaid) || 0,
        advanceTaxPaid: Number(form.advanceTaxPaid) || 0,
      },
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep(step)) return;
    onResult(buildPayload());
  }

  const showDeductionStep = advancedMode || form.selectedRegime === "old" || form.selectedRegime === "autoCompare";
  const visibleSteps = showDeductionStep ? STEPS : STEPS.filter((s) => s !== "Deductions");
  const currentLabel = visibleSteps[step];

  return (
    <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Tax Calculator</h3>
          <p className="text-xs text-zinc-500">FY 2025–26 / AY 2026–27</p>
        </div>
        <button
          onClick={() => setAdvancedMode((v) => !v)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          {advancedMode ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
          {advancedMode ? "Advanced" : "Basic"}
        </button>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-6">
        {visibleSteps.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1" onClick={() => i < step && setStep(i)}>
            <div className={`h-1 w-full rounded-full transition-all duration-300 ${i <= step ? "bg-white" : "bg-white/10"}`} />
            <span className={`text-[10px] transition-colors ${i === step ? "text-white" : "text-zinc-600"}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Preview chip */}
      {preview.gross > 0 && (
        <div className="flex gap-3 mb-5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <PreviewPill label="Gross" value={formatINR(preview.gross)} />
          <PreviewPill label="New" value={formatINR(preview.newTax)} color="text-blue-400" />
          <PreviewPill label="Old" value={formatINR(preview.oldTax)} color="text-amber-400" />
          <PreviewPill
            label="Recommended"
            value={preview.recommended === "new" ? "New Regime" : "Old Regime"}
            color="text-emerald-400"
          />
        </div>
      )}

      {/* Step content */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLabel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentLabel === "Profile" && <StepProfile form={form} onChange={handleChange} />}
            {currentLabel === "Income" && <StepIncome form={form} onChange={handleChange} />}
            {currentLabel === "Deductions" && <StepDeductions form={form} onChange={handleChange} />}
            {currentLabel === "Taxes Paid" && <StepTaxesPaid form={form} onChange={handleChange} />}
          </motion.div>
        </AnimatePresence>

        {/* Validation error */}
        {Object.values(errors).filter(Boolean).map((e, i) => (
          <p key={i} className="text-xs text-rose-400 mt-3">{e}</p>
        ))}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </motion.button>
          )}

          {step < visibleSteps.length - 1 ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={nextStep}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 flex items-center justify-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Calculating…</>
              ) : (
                "Calculate Tax →"
              )}
            </motion.button>
          )}
        </div>
      </form>
    </div>
  );
}

function PreviewPill({ label, value, color = "text-zinc-300" }) {
  return (
    <div className="flex-1 min-w-0 text-center">
      <p className="text-[10px] text-zinc-600 mb-0.5">{label}</p>
      <p className={`text-xs font-medium truncate ${color}`}>{value}</p>
    </div>
  );
}
