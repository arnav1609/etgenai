/**
 * TaxClaimsPage.jsx — /tax/claims
 * Claims & Deductions Advisor — shows all available claims for user's regime.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TaxClaimsAdvisor from "../components/taxation/TaxClaimsAdvisor";
import TaxDisclaimer from "../components/taxation/TaxDisclaimer";
import { EMPLOYMENT_TYPE_LABELS, AGE_CATEGORY_LABELS } from "../utils/taxUtils";

export default function TaxClaimsPage() {
  const navigate = useNavigate();
  const [regime, setRegime] = useState("new");
  const [ageCategory, setAgeCategory] = useState("below60");
  const [employmentType, setEmploymentType] = useState("salaried");

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
          <h1 className="text-sm font-semibold text-white">Tax Claims &amp; Deductions</h1>
          <p className="text-[10px] text-zinc-600">See what you can claim and what you're missing</p>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Profile selector */}
        <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Your Profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Regime */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Tax Regime</label>
              <div className="flex gap-2">
                {["new", "old"].map((r) => (
                  <button key={r} onClick={() => setRegime(r)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${regime === r ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/[0.06] text-zinc-500"}`}>
                    {r === "new" ? "New" : "Old"}
                  </button>
                ))}
              </div>
            </div>
            {/* Age */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Age Category</label>
              <select value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/25 appearance-none">
                {Object.entries(AGE_CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111]">{l}</option>)}
              </select>
            </div>
            {/* Employment */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Employment Type</label>
              <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/25 appearance-none">
                {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111]">{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        <TaxClaimsAdvisor regime={regime} ageCategory={ageCategory} employmentType={employmentType} deductionInputs={{}} taxableIncome={0} />

        <TaxDisclaimer />
      </main>
    </div>
  );
}
