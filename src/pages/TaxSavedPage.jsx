/**
 * TaxSavedPage.jsx — /tax/saved
 * Saved calculations — real MongoDB data, view detail, delete.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TaxSavedList from "../components/taxation/TaxSavedList";
import TaxResults from "../components/taxation/TaxResults";

// Hook to get user ID from localStorage token
function getUserId() {
  try {
    const token = localStorage.getItem("nf_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || payload.userId || null;
  } catch {
    return null;
  }
}

export default function TaxSavedPage() {
  const navigate = useNavigate();
  const userId = getUserId();
  const [detailCalc, setDetailCalc] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function handleViewDetail(calc) {
    // Fetch full detail from API
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem("nf_token");
      const res = await fetch(`/api/tax/calculation/${calc._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setDetailCalc(data.calculation);
    } catch {
      // fallback to list data
      setDetailCalc(calc);
    } finally {
      setLoadingDetail(false);
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
          <h1 className="text-sm font-semibold text-white">Saved Calculations</h1>
          <p className="text-[10px] text-zinc-600">Your tax history from MongoDB</p>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <TaxSavedList userId={userId} onViewDetail={handleViewDetail} />
      </main>

      {/* Detail drawer */}
      <AnimatePresence>
        {detailCalc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            onClick={() => setDetailCalc(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 30 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-medium text-white">{detailCalc.label || "Tax Calculation"}</p>
                  <p className="text-xs text-zinc-500">FY {detailCalc.financialYear}</p>
                </div>
                <button onClick={() => setDetailCalc(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <TaxResults
                result={detailCalc}
                onSave={() => {}}
                onRecalculate={() => { setDetailCalc(null); navigate("/tax/calculate"); }}
                saving={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
