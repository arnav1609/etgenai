/**
 * TaxSummaryCard.jsx
 * Reusable single-value summary card matching the NeuroFin dark-glass design system.
 */
import { motion } from "framer-motion";

export default function TaxSummaryCard({ title, value, subtitle, icon: Icon, color = "text-white", delay = 0, highlight = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-5 rounded-3xl border transition-all ${
        highlight
          ? "bg-white/[0.06] border-white/20"
          : "bg-[#0A0A0A] border-white/[0.06]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{title}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${highlight ? "bg-white/10" : "bg-white/5"}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        )}
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}
