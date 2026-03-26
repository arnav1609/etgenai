/**
 * TaxDashboard.jsx (v2)
 * Taxation hub — 6 linked quick actions, FY2025-26 key figures, slab reference.
 * All cards navigate to real sub-routes.
 */
import { motion } from "framer-motion";
import {
  Calculator, GitCompare, Lightbulb, History, IndianRupee, Zap,
  Wallet, Receipt, TrendingDown, TrendingUp, Globe, BookCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaxSummaryCard from "./TaxSummaryCard";
import { formatINR, formatLakhCrore } from "../../utils/taxUtils";

const QUICK_ACTIONS = [
  { icon: Calculator, label: "Calculate Tax", sub: "Enter income & deductions", route: "/tax/calculate", color: "text-blue-400" },
  { icon: GitCompare, label: "Compare Regimes", sub: "Old vs New — side by side", route: "/tax/compare", color: "text-purple-400" },
  { icon: BookCheck, label: "Tax Claims", sub: "See deductions you're missing", route: "/tax/claims", color: "text-emerald-400" },
  { icon: Lightbulb, label: "Tax-Saving Tips", sub: "Personalised suggestions", route: "/tax/tips", color: "text-amber-400" },
  { icon: History, label: "Saved Calculations", sub: "Your tax history", route: "/tax/saved", color: "text-rose-400" },
  { icon: Globe, label: "International Duty", sub: "Baggage · LRS TCS · Import", route: "/tax/international-duty", color: "text-cyan-400" },
];

const KEY_FIGURES = [
  { title: "New Regime Std. Deduction", value: "₹75,000", note: "Salaried & freelancers (auto-applied)", color: "text-blue-400" },
  { title: "Zero Tax Up To", value: "₹12 Lakh", note: "After std. deduction + 87A rebate (new)", color: "text-emerald-400" },
  { title: "Max 80C Deduction", value: "₹1.5 Lakh", note: "Old regime — PPF, ELSS, LIC, EPF…", color: "text-amber-400" },
  { title: "Health & Education Cess", value: "4%", note: "Applied on total tax payable", color: "text-zinc-300" },
];

const NEW_REGIME_SLABS = [
  { range: "₹0 – ₹4L", rate: "0%", bg: "bg-emerald-500" },
  { range: "₹4L – ₹8L", rate: "5%", bg: "bg-blue-500" },
  { range: "₹8L – ₹12L", rate: "10%", bg: "bg-indigo-500" },
  { range: "₹12L – ₹16L", rate: "15%", bg: "bg-violet-500" },
  { range: "₹16L – ₹20L", rate: "20%", bg: "bg-purple-500" },
  { range: "₹20L – ₹24L", rate: "25%", bg: "bg-orange-500" },
  { range: "Above ₹24L", rate: "30%", bg: "bg-rose-500" },
];

export default function TaxDashboard({ onAction, lastResult }) {
  const navigate = useNavigate();

  function go(route) {
    if (route) navigate(route);
    else if (onAction) onAction(route);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Hero */}
      <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-900/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-900/15 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Indian Tax Service</h2>
              <p className="text-xs text-zinc-500">FY 2025–26 / AY 2026–27</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-md mb-5">
            Know your bracket, compare regimes, find what you can claim, and legally reduce your tax — all with the FY 2025–26 rules.
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => go("/tax/calculate")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-all">
              <Zap className="w-4 h-4" /> Calculate My Tax
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => go("/tax/compare")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm hover:bg-white/10 transition-all">
              <GitCompare className="w-4 h-4" /> Compare Regimes
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => go("/tax/claims")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm hover:bg-white/10 transition-all">
              <BookCheck className="w-4 h-4" /> Review Claims
            </motion.button>
          </div>
        </div>
      </div>

      {/* Last result summary */}
      {lastResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <TaxSummaryCard title="Gross Income" value={formatLakhCrore(lastResult.grossIncome)} subtitle="FY 2025-26" icon={Wallet} delay={0} />
          <TaxSummaryCard title="Tax Payable" value={formatINR(lastResult.recommendedRegime === "new" ? lastResult.newRegimeResult?.finalTax : lastResult.oldRegimeResult?.finalTax)} subtitle={`${lastResult.recommendedRegime === "new" ? "New" : "Old"} Regime`} icon={Receipt} color="text-rose-400" delay={0.05} />
          <TaxSummaryCard title="Tax Saved" value={formatINR(lastResult.taxSavedByOptimalRegime)} subtitle="vs other regime" icon={TrendingDown} color="text-emerald-400" delay={0.1} />
          <TaxSummaryCard title={lastResult.balanceDue < 0 ? "Refund Est." : "Balance Due"} value={formatINR(Math.abs(lastResult.balanceDue))} subtitle={lastResult.balanceDue < 0 ? "File ITR to claim" : "Pay before filing"} icon={lastResult.balanceDue < 0 ? TrendingDown : TrendingUp} color={lastResult.balanceDue < 0 ? "text-emerald-400" : "text-amber-400"} delay={0.15} />
        </div>
      )}

      {/* Quick Actions — all 6, all linked */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, sub, route, color }, i) => (
            <motion.button key={route} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => go(route)}
              className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/[0.06] hover:border-white/15 text-left transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Key Figures */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">FY 2025-26 Key Figures</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {KEY_FIGURES.map((h, i) => (
            <motion.div key={h.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
              className="p-4 rounded-2xl bg-[#0A0A0A] border border-white/[0.06]">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">{h.title}</p>
              <p className={`text-xl font-semibold ${h.color}`}>{h.value}</p>
              <p className="text-[10px] text-zinc-600 mt-1">{h.note}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slab Reference */}
      <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-white">New Regime — Tax Slabs (FY 2025-26)</p>
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => go("/tax/compare")}
            className="text-xs text-zinc-500 hover:text-white border border-white/10 rounded-lg px-2.5 py-1 bg-white/5 hover:bg-white/10 transition-all">
            Compare →
          </motion.button>
        </div>
        <div className="space-y-2">
          {NEW_REGIME_SLABS.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.bg} flex-shrink-0`} />
              <span className="text-xs text-zinc-400 flex-1">{s.range}</span>
              <span className="text-xs font-medium text-zinc-300">{s.rate}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-600 mt-4">
          Incomes up to ₹12L (after ₹75K std. deduction) effectively pay ₹0 under Section 87A rebate.
        </p>
      </div>
    </motion.div>
  );
}
