/**
 * TaxTipsPage.jsx — /tax/tips
 * Tax-saving guidance hub with clear "confirmed vs possible" labelling.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TaxInsights from "../components/taxation/TaxInsights";
import TaxDisclaimer from "../components/taxation/TaxDisclaimer";
import TaxClaimsAdvisor from "../components/taxation/TaxClaimsAdvisor";

export default function TaxTipsPage() {
  const navigate = useNavigate();
  const [salary, setSalary] = useState("");
  const [regime, setRegime] = useState("new");
  const [ageCategory, setAgeCategory] = useState("below60");
  const [insights, setInsights] = useState([]);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taxableIncome, setTaxableIncome] = useState(0);

  async function runAnalysis() {
    if (!salary) { setError("Enter your income to see personalised tips"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tax/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageCategory, selectedRegime: regime,
          incomeInputs: { salaryIncome: Number(salary) },
          deductionInputs: {}, taxesPaid: {},
        }),
      });
      if (!res.ok) throw new Error("Calculation failed");
      const data = await res.json();
      setInsights(data.insights || []);
      const ti = regime === "new" ? data.result?.newRegimeResult?.taxableIncome : data.result?.oldRegimeResult?.taxableIncome;
      setTaxableIncome(ti || 0);
      setAnalysisReady(true);
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
          <h1 className="text-sm font-semibold text-white">Tax-Saving Tips</h1>
          <p className="text-[10px] text-zinc-600">Personalised guidance based on your income</p>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Quick input */}
        {!analysisReady && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]"
          >
            <h2 className="text-base font-medium text-white mb-4">Quick Setup</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Annual Salary / Income (₹)</label>
                <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 1200000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/25 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1.5">Regime</label>
                  <div className="flex gap-2">
                    {["new", "old"].map((r) => (
                      <button key={r} onClick={() => setRegime(r)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${regime === r ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/[0.06] text-zinc-500"}`}>
                        {r === "new" ? "New" : "Old"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-zinc-400 mb-1.5">Age</label>
                  <select value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none appearance-none">
                    <option value="below60" className="bg-[#111]">Below 60</option>
                    <option value="senior60to80" className="bg-[#111]">Senior (60–80)</option>
                    <option value="superSenior80plus" className="bg-[#111]">Super Senior (80+)</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={runAnalysis} disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Calculator className="w-4 h-4" /> Get My Tips</>}
              </motion.button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {analysisReady && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-light text-white">Your Tax-Saving Opportunities</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Based on ₹{Number(salary).toLocaleString("en-IN")} income under {regime === "new" ? "new" : "old"} regime</p>
                </div>
                <button onClick={() => setAnalysisReady(false)} className="text-xs text-zinc-500 hover:text-white">Change inputs</button>
              </div>

              {/* Insights from recommendation engine */}
              <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Smart Recommendations</p>
                <TaxInsights insights={insights} />
              </div>

              {/* Claims analysis */}
              <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Claim Opportunities</p>
                <TaxClaimsAdvisor regime={regime} ageCategory={ageCategory} employmentType="salaried" deductionInputs={{}} taxableIncome={taxableIncome} />
              </div>

              <TaxDisclaimer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
