/**
 * TaxResults.jsx
 * Full results breakdown panel — slab table, cess, rebate, refund/due, and comparison.
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt, TrendingDown, TrendingUp, CheckCircle, AlertCircle, Save, RotateCcw
} from "lucide-react";
import { formatINR } from "../../utils/taxUtils";
import TaxRegimeComparison from "./TaxRegimeComparison";
import TaxDisclaimer from "./TaxDisclaimer";

function LineRow({ label, value, sub, valueClass = "text-white", border = false }) {
  return (
    <div className={`flex justify-between items-start py-2.5 ${border ? "border-t border-white/[0.06]" : ""}`}>
      <div>
        <p className="text-sm text-zinc-300">{label}</p>
        {sub && <p className="text-xs text-zinc-600">{sub}</p>}
      </div>
      <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function SlabTable({ breakdown, regime }) {
  if (!breakdown?.length) return null;
  return (
    <div className="mt-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Slab Breakdown</p>
      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
        <table className="w-full text-xs">
          <thead className="bg-white/[0.03]">
            <tr>
              <th className="text-left px-3 py-2 text-zinc-500 font-medium">Income range</th>
              <th className="text-right px-3 py-2 text-zinc-500 font-medium">Rate</th>
              <th className="text-right px-3 py-2 text-zinc-500 font-medium">Tax</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((s, i) => (
              <tr key={i} className="border-t border-white/[0.04]">
                <td className="px-3 py-2 text-zinc-400">
                  {formatINR(s.from)} – {s.to ? formatINR(s.to) : "above"}
                </td>
                <td className="px-3 py-2 text-right text-zinc-400">{(s.rate * 100).toFixed(0)}%</td>
                <td className="px-3 py-2 text-right text-zinc-300 font-medium">{formatINR(s.taxForSlab)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TaxResults({ result, insights, onSave, onRecalculate, saving = false }) {
  if (!result) return null;

  const { newRegimeResult, oldRegimeResult, comparison, recommendedRegime, balanceDue, refundEstimate, totalTaxPaid, grossIncome } = result;
  const displayResult = recommendedRegime === "new" ? newRegimeResult : oldRegimeResult;

  const isRefund = balanceDue < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Tax Results</h3>
          <p className="text-zinc-500 text-sm">FY 2025–26 · AY 2026–27</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onRecalculate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Recalculate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save"}
          </motion.button>
        </div>
      </div>

      {/* Recommended regime banner */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-3 p-4 rounded-2xl border ${
            displayResult.finalTax === 0
              ? "bg-emerald-500/[0.08] border-emerald-500/25"
              : recommendedRegime === "new"
              ? "bg-blue-500/[0.06] border-blue-500/20"
              : "bg-amber-500/[0.06] border-amber-500/20"
          }`}
        >
          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${displayResult.finalTax === 0 ? "text-emerald-400" : recommendedRegime === "new" ? "text-blue-400" : "text-amber-400"}`} />
          <div>
            <p className="text-sm font-medium text-white">
              {displayResult.finalTax === 0
                ? "🎉 Zero Tax! You have no income tax liability this year."
                : `${recommendedRegime === "new" ? "New" : "Old"} Regime is better for you`}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{comparison?.reason}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Primary result card */}
      <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
          Under {recommendedRegime === "new" ? "New" : "Old"} Regime
        </p>

        <LineRow label="Gross Income" value={formatINR(grossIncome)} />
        {displayResult.regime === "old" && (
          <LineRow label="Total Deductions" value={`-${formatINR(displayResult.totalDeductions)}`} valueClass="text-zinc-300" />
        )}
        <LineRow label="Standard Deduction" value={`-${formatINR(displayResult.standardDeduction)}`} valueClass="text-zinc-300" />
        <LineRow
          label="Taxable Income"
          value={formatINR(displayResult.taxableIncome)}
          valueClass="text-white font-semibold"
          border
        />

        <SlabTable breakdown={displayResult.slabBreakdown} />

        <div className="mt-4 space-y-0.5 pt-2 border-t border-white/[0.06]">
          <LineRow label="Base Tax" value={formatINR(displayResult.baseTax)} />
          {displayResult.rebate87A > 0 && (
            <LineRow
              label="Section 87A Rebate"
              sub="Applied — your income is within the rebate threshold"
              value={`-${formatINR(displayResult.rebate87A)}`}
              valueClass="text-emerald-400"
            />
          )}
          {displayResult.surcharge > 0 && (
            <LineRow label="Surcharge" value={formatINR(displayResult.surcharge)} valueClass="text-rose-400" />
          )}
          <LineRow label="Health & Education Cess (4%)" value={formatINR(displayResult.cess)} />
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-base font-semibold text-white">Final Tax Payable</p>
              <p className="text-xs text-zinc-500">Incl. cess {displayResult.surcharge > 0 ? "& surcharge" : ""}</p>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{formatINR(displayResult.finalTax)}</p>
          </div>
          <p className="text-xs text-zinc-600 mt-1">Effective rate: {displayResult.effectiveRate}%</p>
        </div>
      </div>

      {/* TDS / Advance tax / Refund */}
      {(totalTaxPaid > 0 || balanceDue !== 0) && (
        <div className="p-5 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Tax Already Paid</p>
          <LineRow label="TDS Deducted (estimated)" value={formatINR(result.totalTaxPaid)} />
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            {isRefund ? (
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">Refund Estimate: {formatINR(refundEstimate)}</p>
                  <p className="text-xs text-zinc-500">File your ITR to claim the refund</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                <div>
                  <p className="text-sm font-medium text-rose-400">Balance Tax Due: {formatINR(balanceDue)}</p>
                  <p className="text-xs text-zinc-500">Pay via advance tax or self-assessment tax before filing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regime comparison */}
      <TaxRegimeComparison newResult={newRegimeResult} oldResult={oldRegimeResult} comparison={comparison} />

      <TaxDisclaimer />
    </motion.div>
  );
}
