/**
 * TaxRegimeComparison.jsx
 * Side-by-side card comparing old vs new regime tax results.
 */
import { motion } from "framer-motion";
import { CheckCircle, TrendingDown } from "lucide-react";
import { formatINR, formatLakhCrore } from "../../utils/taxUtils";

export default function TaxRegimeComparison({ newResult, oldResult, comparison }) {
  if (!newResult || !oldResult) return null;
  const { recommended, saving } = comparison || {};

  const regimes = [
    { key: "new", label: "New Regime", result: newResult },
    { key: "old", label: "Old Regime", result: oldResult },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium text-white">Regime Comparison</h3>
        {saving > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Save {formatLakhCrore(saving)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {regimes.map(({ key, label, result }) => {
          const isRecommended = recommended === key;
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.01 }}
              className={`relative p-4 rounded-2xl border transition-all ${
                isRecommended
                  ? "bg-emerald-500/[0.06] border-emerald-500/25"
                  : "bg-white/[0.02] border-white/[0.05]"
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  BETTER
                </div>
              )}

              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{label}</p>

              <p className={`text-2xl font-semibold tracking-tight mb-1 ${isRecommended ? "text-emerald-400" : "text-white"}`}>
                {formatINR(result.finalTax)}
              </p>

              <div className="space-y-1.5 mt-3 pt-3 border-t border-white/[0.06]">
                <Row label="Taxable Income" value={formatINR(result.taxableIncome)} />
                <Row label="Std. Deduction" value={formatINR(result.standardDeduction)} />
                <Row label="Base Tax" value={formatINR(result.baseTax)} />
                {result.rebate87A > 0 && (
                  <Row label="87A Rebate" value={`-${formatINR(result.rebate87A)}`} valueClass="text-emerald-400" />
                )}
                {result.cess > 0 && <Row label="Cess (4%)" value={formatINR(result.cess)} />}
                <Row label="Effective Rate" value={`${result.effectiveRate}%`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {comparison?.reason && (
        <p className="text-xs text-zinc-500 mt-4 leading-relaxed">{comparison.reason}</p>
      )}
    </motion.div>
  );
}

function Row({ label, value, valueClass = "text-zinc-300" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-zinc-600">{label}</span>
      <span className={`text-xs font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
