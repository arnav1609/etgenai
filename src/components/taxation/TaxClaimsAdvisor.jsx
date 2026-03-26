/**
 * TaxClaimsAdvisor.jsx
 * Claims & Deductions advisor — used, unused, ineligible buckets from API.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Circle, ChevronDown, AlertCircle, Loader2, Info } from "lucide-react";
import { formatINR } from "../../utils/taxUtils";

// Single claim card
function ClaimCard({ claim, status, index }) {
  const [open, setOpen] = useState(false);

  const statusConfig = {
    used: { color: "text-emerald-400", bg: "bg-emerald-500/[0.06] border-emerald-500/20", Icon: CheckCircle, label: "Using" },
    unused: { color: "text-amber-400", bg: "bg-amber-500/[0.06] border-amber-500/20", Icon: Circle, label: "Not claimed" },
    ineligible: { color: "text-zinc-600", bg: "bg-white/[0.02] border-white/[0.05]", Icon: XCircle, label: "Not eligible" },
  };

  const { color, bg, Icon, label } = statusConfig[status];

  const regimeTag = {
    old_only: { text: "Old Regime only", cls: "bg-amber-500/15 text-amber-400" },
    new_only: { text: "New Regime only", cls: "bg-blue-500/15 text-blue-400" },
    both: { text: "Both regimes", cls: "bg-emerald-500/15 text-emerald-400" },
  }[claim.regime] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border ${bg} overflow-hidden`}
    >
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-4 flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${status === "ineligible" ? "text-zinc-500" : "text-white"}`}>{claim.name}</p>
            {regimeTag.text && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${regimeTag.cls}`}>{regimeTag.text}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className={`text-xs ${color}`}>{label}</span>
            {claim.maxLimit && (
              <span className="text-xs text-zinc-600">Max: {formatINR(claim.maxLimit)}</span>
            )}
            {claim.currentValue > 0 && (
              <span className="text-xs text-zinc-400">Claimed: {formatINR(claim.currentValue)}</span>
            )}
            {status === "unused" && claim.estimatedSaving > 0 && (
              <span className="text-xs text-emerald-400 font-medium">Save up to ~{formatINR(claim.estimatedSaving)}</span>
            )}
          </div>
          {status === "ineligible" && claim.reason && (
            <p className="text-[10px] text-zinc-600 mt-0.5">{claim.reason}</p>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="w-4 h-4 text-zinc-600 flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3">
              {claim.description && (
                <p className="text-xs text-zinc-400 leading-relaxed">{claim.description}</p>
              )}
              {claim.helpText && (
                <p className="text-xs text-zinc-500 leading-relaxed border-l-2 border-white/10 pl-3">{claim.helpText}</p>
              )}
              {claim.legalSection && (
                <p className="text-[10px] text-zinc-600">{claim.legalSection}</p>
              )}
              {claim.proofRequired?.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Documents Required</p>
                  <ul className="space-y-1">
                    {claim.proofRequired.map((doc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="w-1 h-1 rounded-full bg-zinc-600 flex-shrink-0 mt-1.5" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {status === "unused" && claim.maxLimit && (
                <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                  <p className="text-xs text-amber-400">
                    You could claim up to {formatINR(claim.maxLimit)} and potentially save ~{formatINR(claim.estimatedSaving)} in taxes.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main component
export default function TaxClaimsAdvisor({ regime = "new", ageCategory = "below60", employmentType = "salaried", deductionInputs = {}, taxableIncome = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("unused");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tax/claims/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regime, ageCategory, employmentType, deductionInputs, taxableIncome }),
        });
        if (!res.ok) throw new Error("Failed to load claims");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [regime, ageCategory, employmentType, taxableIncome]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-zinc-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Analysing your claims…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-10">
        <AlertCircle className="w-6 h-6 text-rose-400" />
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  const tabs = [
    { id: "unused", label: "Opportunities", count: data?.unused?.length },
    { id: "used", label: "Claimed", count: data?.used?.length },
    { id: "ineligible", label: "Not Eligible", count: data?.ineligible?.length },
  ];

  const activeItems = data?.[activeTab] || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Summary bar */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-center">
            <p className="text-xl font-semibold text-emerald-400">{data.summary.usedCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Active Claims</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 text-center">
            <p className="text-xl font-semibold text-amber-400">{data.summary.unusedCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Available</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-xl font-semibold text-white">{formatINR(data.summary.estimatedAdditionalSaving)}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Potential Extra Saving</p>
          </div>
        </div>
      )}

      {/* Info pill for new regime */}
      {regime === "new" && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-500/[0.06] border border-blue-500/20">
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300/80">
            Under the new regime, most deductions are not available. Standard deduction and 87A rebate are built in automatically.
          </p>
        </div>
      )}

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${activeTab === tab.id ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400"}`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-white/10" : "bg-white/5"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Claim list */}
      <div className="space-y-2">
        {activeItems.length === 0 ? (
          <p className="text-center text-xs text-zinc-600 py-6">
            {activeTab === "unused" ? "Great — you are using all available deductions!" :
             activeTab === "used" ? "No active claims found for your current inputs." :
             "No ineligible claims for your profile."}
          </p>
        ) : (
          activeItems.map((claim, i) => (
            <ClaimCard key={claim.code} claim={claim} status={activeTab} index={i} />
          ))
        )}
      </div>
    </motion.div>
  );
}
