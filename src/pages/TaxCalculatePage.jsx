/**
 * TaxCalculatePage.jsx — /tax/calculate
 * Dedicated route for the multi-step tax calculator.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TaxCalculatorForm from "../components/taxation/TaxCalculatorForm";
import TaxResults from "../components/taxation/TaxResults";
import TaxInsights from "../components/taxation/TaxInsights";

export default function TaxCalculatePage() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [insights, setInsights] = useState([]);
  const [lastPayload, setLastPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMsg, setSaveMsg] = useState(null);
  const [view, setView] = useState("form"); // "form" | "results"

  async function handleCalculate(payload) {
    setError(null);
    setLoading(true);
    setLastPayload(payload);
    try {
      const res = await fetch("/api/tax/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed"); }
      const data = await res.json();
      setResult(data.result);
      setInsights(data.insights || []);
      setView("results");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!lastPayload) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("nf_token");
      const res = await fetch("/api/tax/save", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(lastPayload),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveMsg("Calculation saved ✓");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-12">
      {/* Nav */}
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
          <h1 className="text-sm font-semibold text-white">Tax Calculator</h1>
          <p className="text-[10px] text-zinc-600">FY 2025–26 / AY 2026–27</p>
        </div>
        {view === "results" && (
          <button onClick={() => setView("form")} className="ml-auto text-xs text-zinc-500 hover:text-white">
            ← Edit Inputs
          </button>
        )}
      </nav>

      {/* Toast */}
      <AnimatePresence>
        {saveMsg && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[99] bg-emerald-500 text-black text-sm font-medium px-5 py-3 rounded-2xl shadow-lg"
          >{saveMsg}</motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[99] bg-rose-500/90 text-white text-sm px-5 py-3 rounded-2xl shadow-lg"
          >{error} <button onClick={() => setError(null)} className="ml-2 opacity-70">✕</button></motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-2xl mx-auto">
              <TaxCalculatorForm onResult={handleCalculate} loading={loading} />
            </motion.div>
          )}
          {view === "results" && result && (
            <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <TaxResults result={result} onSave={handleSave} onRecalculate={() => setView("form")} saving={saving} />
              </div>
              <div className="lg:col-span-4">
                <TaxInsights insights={insights} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
