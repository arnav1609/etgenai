/**
 * TaxationPage.jsx (v2)
 * Main /tax route — dashboard hub with correct react-router Links.
 * Sub-routes (/tax/calculate etc.) are handled by their own dedicated pages.
 */
import { useNavigate } from "react-router-dom";
import TaxDashboard from "../components/taxation/TaxDashboard";
import { Receipt } from "lucide-react";

export default function TaxationPage() {
  const navigate = useNavigate();

  function handleAction(action) {
    const routes = {
      calculator: "/tax/calculate",
      compare: "/tax/compare",
      claims: "/tax/claims",
      insights: "/tax/tips",
      tips: "/tax/tips",
      history: "/tax/saved",
      internationalDuty: "/tax/international-duty",
    };
    if (routes[action]) navigate(routes[action]);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-16">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 sticky top-0 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          {/* NeuroFin logo → dashboard */}
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-white/40 transition-all">
              <img src="/src/assets/logo.png" alt="NeuroFin" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs tracking-[0.18em] font-medium text-white/70 group-hover:text-white transition-colors">NEUROFIN</span>
          </button>

          {/* Page label */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">Tax Service</h1>
              <p className="text-[10px] text-zinc-600">FY 2025–26</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <TaxDashboard onAction={handleAction} lastResult={null} />
      </main>
    </div>
  );
}
