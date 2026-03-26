/**
 * TaxSavedList.jsx
 * Fully-connected saved calculations list — real data from MongoDB.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, Edit2, AlertCircle, Calendar, Receipt, TrendingDown, TrendingUp, Loader2, BookOpen } from "lucide-react";
import { formatINR, formatLakhCrore } from "../../utils/taxUtils";

const AGE_MAP = { below60: "Below 60", senior60to80: "Senior (60–80)", superSenior80plus: "Super Senior (80+)" };
const EMP_MAP = { salaried: "Salaried", selfEmployed: "Self-Employed", freelancer: "Freelancer", business: "Business" };

function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Delete Calculation?</p>
            <p className="text-xs text-zinc-500">This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-500/90 text-white text-sm font-medium hover:bg-rose-500 transition-all">Delete</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SavedCard({ calc, onView, onDelete, deleting }) {
  const finalTax = calc.recommendedRegime === "new"
    ? calc.newRegimeResult?.finalTax
    : calc.oldRegimeResult?.finalTax;
  const isRefund = (calc.balanceDue ?? 0) < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/[0.06] hover:border-white/[0.12] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-white leading-none">{calc.label || "Tax Calculation"}</p>
          <p className="text-[10px] text-zinc-600 mt-1">
            FY {calc.financialYear} · {AGE_MAP[calc.ageCategory] || calc.ageCategory} · {EMP_MAP[calc.employmentType] || calc.employmentType}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onView(calc)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(calc._id)} disabled={deleting === calc._id} className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-all">
            {deleting === calc._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">Gross Income</p>
          <p className="text-sm font-medium text-zinc-300">{formatLakhCrore(calc.grossIncome)}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">Tax Payable</p>
          <p className="text-sm font-semibold text-white">{formatINR(finalTax)}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">Better Regime</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${calc.recommendedRegime === "new" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
            {calc.recommendedRegime === "new" ? "New" : "Old"} Regime
          </span>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600 mb-0.5">{isRefund ? "Refund Est." : "Balance Due"}</p>
          <p className={`text-sm font-medium ${isRefund ? "text-emerald-400" : "text-amber-400"}`}>
            {formatINR(Math.abs(calc.balanceDue ?? 0))}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-zinc-700 mt-3 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {new Date(calc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>
    </motion.div>
  );
}

export default function TaxSavedList({ userId, onViewDetail }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("nf_token");
      const res = await fetch(`/api/tax/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function handleDelete(id) {
    setDeleting(id);
    setDeleteTarget(null);
    try {
      const token = localStorage.getItem("nf_token");
      await fetch(`/api/tax/calculation/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setHistory((h) => h.filter((c) => c._id !== id));
    } catch {
      setError("Delete failed. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <AlertCircle className="w-8 h-8 text-rose-400" />
        <p className="text-sm text-rose-400">Failed to load calculations</p>
        <p className="text-xs text-zinc-600">{error}</p>
        <button onClick={fetchHistory} className="text-xs text-zinc-400 hover:text-white underline">Try again</button>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">Login to view your saved calculations</p>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">No saved calculations yet</p>
        <p className="text-xs text-zinc-600 mt-1">Calculate your tax and save it to see it here</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            onConfirm={() => handleDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {history.map((calc) => (
            <SavedCard
              key={calc._id}
              calc={calc}
              onView={onViewDetail}
              onDelete={(id) => setDeleteTarget(id)}
              deleting={deleting}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
