/**
 * TaxInternationalDuty.jsx
 * Tabbed international duty estimator — baggage, LRS TCS, overseas tour, forex, import.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Calculator, Loader2, Info } from "lucide-react";
import { formatINR } from "../../utils/taxUtils";

const TABS = [
  { id: "baggage", label: "Baggage Duty" },
  { id: "remittance_tcs", label: "LRS Remittance TCS" },
  { id: "overseas_tour_tcs", label: "Overseas Tour TCS" },
  { id: "forex_charges", label: "Forex GST" },
  { id: "import_duty", label: "Import Duty" },
];

function ResultCard({ result }) {
  if (!result) return null;

  const rows = {
    baggage: [
      { label: "Total Value", value: formatINR(result.totalValue) },
      { label: "Free Allowance", value: formatINR(result.freeAllowance) },
      { label: "Excess Amount", value: formatINR(result.excessAmount) },
      { label: "Duty Rate", value: `${(result.dutyRate * 100).toFixed(0)}%` },
      { label: "Estimated Duty", value: formatINR(result.estimatedDuty), highlight: true },
    ],
    remittance_tcs: [
      { label: "Total Remittance", value: formatINR(result.totalAmount) },
      { label: "TCS Threshold", value: formatINR(result.threshold) },
      { label: "Taxable Amount", value: formatINR(result.taxableAmount) },
      { label: "TCS Rate", value: `${(result.tcsRate * 100).toFixed(0)}%` },
      { label: "Estimated TCS", value: formatINR(result.estimatedTCS), highlight: true },
    ],
    overseas_tour_tcs: [
      { label: "Package Amount", value: formatINR(result.packageAmount) },
      { label: "TCS Rate", value: `${(result.tcsRate * 100).toFixed(0)}%` },
      { label: "Estimated TCS", value: formatINR(result.estimatedTCS), highlight: true },
    ],
    forex_gst: [
      { label: "Conversion Amount", value: formatINR(result.amount) },
      { label: "Description", value: result.description },
      { label: "Estimated GST", value: formatINR(result.estimatedGST), highlight: true },
    ],
    import_duty: [
      { label: "CIF Value", value: formatINR(result.cifValue) },
      { label: "Goods Category", value: result.goodsCategory },
      { label: "Composite Rate", value: `${(result.dutyRate * 100).toFixed(0)}%` },
      { label: "Estimated Duty", value: formatINR(result.estimatedDuty), highlight: true },
    ],
  };

  const resultRows = rows[result.type] || rows["forex_gst"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-2xl bg-[#0f0f0f] border border-white/[0.08]"
    >
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Estimate Result</p>
      <div className="space-y-2.5">
        {resultRows.map((row, i) => (
          <div key={i} className={`flex justify-between items-center ${row.highlight ? "pt-2.5 border-t border-white/[0.08]" : ""}`}>
            <span className="text-xs text-zinc-500">{row.label}</span>
            <span className={`text-xs font-medium ${row.highlight ? "text-white text-sm" : "text-zinc-300"}`}>{row.value}</span>
          </div>
        ))}
      </div>
      {result.notes && (
        <p className="text-[10px] text-zinc-600 mt-3 leading-relaxed border-t border-white/[0.06] pt-3">{result.notes}</p>
      )}
      {result.creditable && (
        <p className="text-[10px] text-emerald-400/80 mt-2">✓ TCS collected is creditable against your ITR tax liability</p>
      )}
    </motion.div>
  );
}

export default function TaxInternationalDuty() {
  const [activeTab, setActiveTab] = useState("baggage");
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setResult(null);
  }

  async function handleEstimate() {
    setLoading(true);
    setError(null);
    try {
      let item = { type: activeTab };

      if (activeTab === "baggage") {
        item = { ...item, totalValue: Number(form.totalValue) || 0, residentAbroad: form.residentAbroad === "yes" };
      } else if (activeTab === "remittance_tcs") {
        item = { ...item, amount: Number(form.amount) || 0, purpose: form.purpose || "general" };
      } else if (activeTab === "overseas_tour_tcs") {
        item = { ...item, packageAmount: Number(form.packageAmount) || 0 };
      } else if (activeTab === "forex_charges") {
        item = { ...item, amount: Number(form.amount) || 0 };
      } else if (activeTab === "import_duty") {
        item = { ...item, cifValue: Number(form.cifValue) || 0, goodsCategory: form.goodsCategory || "electronics" };
      }

      const res = await fetch("/api/tax/international-duty/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [item] }),
      });
      if (!res.ok) throw new Error("Estimation failed");
      const data = await res.json();
      setResult(data.estimates?.[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function Input({ label, name, placeholder, type = "number", hint }) {
    return (
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{label}</label>
        {hint && <p className="text-[10px] text-zinc-600 mb-1.5">{hint}</p>}
        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    );
  }

  function Select({ label, name, options }) {
    return (
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{label}</label>
        <select
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/25 transition-all appearance-none"
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value} className="bg-[#111] text-white">{label}</option>
          ))}
        </select>
      </div>
    );
  }

  const formsByTab = {
    baggage: (
      <div className="space-y-4">
        <Input label="Total Value of Goods (₹)" name="totalValue" placeholder="e.g. 80000" hint="Total CIF value of goods brought from abroad" />
        <Select label="Resident status" name="residentAbroad" options={[
          { value: "no", label: "Returning resident (< 1 year abroad)" },
          { value: "yes", label: "Resident returning after > 1 year abroad" },
        ]} />
      </div>
    ),
    remittance_tcs: (
      <div className="space-y-4">
        <Input label="Total Remittance Amount (₹)" name="amount" placeholder="e.g. 1000000" hint="Total amount to be sent abroad under LRS in this FY" />
        <Select label="Purpose of Remittance" name="purpose" options={[
          { value: "general", label: "General / Investment / Gifts" },
          { value: "education", label: "Education abroad" },
        ]} />
      </div>
    ),
    overseas_tour_tcs: (
      <div className="space-y-4">
        <Input label="Package Amount (₹)" name="packageAmount" placeholder="e.g. 150000" hint="Total overseas tour package booked through Indian tour operator" />
      </div>
    ),
    forex_charges: (
      <div className="space-y-4">
        <Input label="Forex Conversion Amount (₹)" name="amount" placeholder="e.g. 500000" hint="Amount in INR being converted to foreign currency" />
      </div>
    ),
    import_duty: (
      <div className="space-y-4">
        <Input label="CIF Value (₹)" name="cifValue" placeholder="e.g. 50000" hint="Cost + Insurance + Freight value of goods in INR" />
        <Select label="Goods Category" name="goodsCategory" options={[
          { value: "electronics",  label: "Consumer Electronics" },
          { value: "clothing",     label: "Clothing & Textiles" },
          { value: "footwear",     label: "Footwear & Shoes" },
          { value: "watches",      label: "Watches & Clocks" },
          { value: "jewellery",    label: "Jewellery & Precious Metals" },
          { value: "furniture",    label: "Furniture & Home Furnishing" },
          { value: "cosmetics",    label: "Cosmetics & Personal Care" },
          { value: "sports",       label: "Sports & Fitness Equipment" },
          { value: "toys",         label: "Toys & Games" },
          { value: "food",         label: "Packaged Food & Beverages" },
          { value: "books",        label: "Books & Printed Matter" },
        ]} />
      </div>
    ),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Separation notice */}
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-blue-500/[0.06] border border-blue-500/20">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80 leading-relaxed">
          These are <strong>separate from income tax</strong>. Customs duty, import IGST, LRS TCS, and forex charges are collected
          independently and generally cannot offset your income tax — except TCS which is creditable in your ITR.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null); setForm({}); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeTab === tab.id ? "bg-white/10 border border-white/20 text-white" : "bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-zinc-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {formsByTab[activeTab]}

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleEstimate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            {loading ? "Estimating…" : "Estimate"}
          </motion.button>

          {result && <ResultCard result={result} />}
        </motion.div>
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          All estimates are approximate and for guidance only. Verify with official customs, FEMA/RBI guidelines, or consult a legal advisor for exact figures.
        </p>
      </div>
    </motion.div>
  );
}
