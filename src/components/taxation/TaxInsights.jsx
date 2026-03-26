/**
 * TaxInsights.jsx
 * Personalised tax-saving insight cards generated from the recommendation engine.
 */
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, TrendingDown, Info, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import TaxDisclaimer from "./TaxDisclaimer";

const ICON_MAP = {
  nilTax: { Icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  regime: { Icon: TrendingDown, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  savings: { Icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  info: { Icon: Info, color: "text-zinc-400", bg: "bg-white/[0.03] border-white/[0.08]" },
  default: { Icon: AlertCircle, color: "text-zinc-400", bg: "bg-white/[0.03] border-white/[0.08]" },
};

function InsightCard({ insight, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const meta = ICON_MAP[insight.type] || ICON_MAP.default;
  const { Icon, color, bg } = meta;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`rounded-2xl border ${bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${color} leading-snug`}>{insight.title}</p>
          {insight.savingHint > 0 && (
            <p className="text-xs text-emerald-400 mt-0.5 font-medium">
              Potential saving: ₹{Math.round(insight.savingHint).toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs text-zinc-400 leading-relaxed px-4 pb-4 pt-1">
              {insight.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TaxInsights({ insights = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div className="text-center py-10 text-zinc-500 text-sm">
        Enter your income details to see personalised tax-saving suggestions.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Tax-Saving Insights</h3>
        <span className="text-xs text-zinc-500">{insights.length} suggestions</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} index={i} />
        ))}
      </div>

      <TaxDisclaimer />
    </motion.div>
  );
}
