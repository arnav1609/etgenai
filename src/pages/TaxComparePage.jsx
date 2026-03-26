/**
 * TaxComparePage.jsx — /tax/compare
 * Regime comparison — fetches live rules from API and shows side-by-side.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TaxRegimeComparison from "../components/taxation/TaxRegimeComparison";
import TaxInsights from "../components/taxation/TaxInsights";
import TaxDisclaimer from "../components/taxation/TaxDisclaimer";
import { formatINR, EMPLOYMENT_TYPE_LABELS, AGE_CATEGORY_LABELS } from "../utils/taxUtils";

export default function TaxComparePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ salary: "", ageCategory: "below60", employmentType: "salaried", section80C: "", section80D: "", nps: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function change(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleCompare(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ageCategory: form.ageCategory,
        employmentType: form.employmentType,
        selectedRegime: "autoCompare",
        incomeInputs: { salaryIncome: Number(form.salary) || 0 },
        deductionInputs: {
          section80C: Number(form.section80C) || 0,
          section80D_self: Number(form.section80D) || 0,
          section80CCD1B: Number(form.nps) || 0,
        },
        taxesPaid: {},
      };
      const res = await fetch("/api/tax/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Comparison failed");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.06] px-4 sm:px-8 py-4 flex items-center gap-3">
        {/* NeuroFin logo → dashboard */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5 group mr-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-white/40 transition-all">
            <img src="/src/assets/logo.png" alt="NeuroFin" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs tracking-[0.18em] font-medium text-white/70 group-hover:text-white transition-colors hidden sm:block">NEUROFIN</span>
        </button>
        <div className="w-px h-5 bg-white/10" />
        <button onClick={() => navigate("/tax")} className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white">Regime Comparison</h1>
          <p className="text-[10px] text-zinc-600">Old vs New — FY 2025–26</p>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Quick input form */}
        <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
          <h2 className="text-base font-medium text-white mb-5">Quick Comparison</h2>
          <form onSubmit={handleCompare} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Annual Salary / Income</label>
                <input type="number" name="salary" value={form.salary} onChange={change} placeholder="₹ 0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">80C Investments</label>
                <input type="number" name="section80C" value={form.section80C} onChange={change} placeholder="₹ 0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">80D Health Insurance</label>
                <input type="number" name="section80D" value={form.section80D} onChange={change} placeholder="₹ 0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">NPS — 80CCD(1B)</label>
                <input type="number" name="nps" value={form.nps} onChange={change} placeholder="₹ 0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Age Category</label>
                <select name="ageCategory" value={form.ageCategory} onChange={change} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/25 transition-all appearance-none">
                  {Object.entries(AGE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111]">{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Employment Type</label>
                <select name="employmentType" value={form.employmentType} onChange={change} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/25 transition-all appearance-none">
                  {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111]">{l}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Comparing…</> : "Compare Regimes →"}
            </motion.button>
          </form>
        </div>

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <TaxRegimeComparison newResult={data.newRegime} oldResult={data.oldRegime} comparison={{ recommended: data.recommendedRegime, saving: data.taxSavedByOptimalRegime, reason: data.comparison?.reason }} />
              {data.insights?.length > 0 && (
                <div>
                  <h3 className="text-base font-medium text-white mb-4">Why This Regime Wins</h3>
                  <TaxInsights insights={data.insights} />
                </div>
              )}
              <TaxDisclaimer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
