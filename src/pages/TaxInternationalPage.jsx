/**
 * TaxInternationalPage.jsx — /tax/international-duty
 * International duty estimator hub page.
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import TaxInternationalDuty from "../components/taxation/TaxInternationalDuty";

export default function TaxInternationalPage() {
  const navigate = useNavigate();

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
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">International Duty &amp; Charges</h1>
            <p className="text-[10px] text-zinc-600">Baggage · Import Duty · LRS TCS · Forex · Overseas Tour</p>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white">International Duty Estimator</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Estimate customs duty, import charges, LRS TCS, and forex-related costs — <em>separate</em> from income tax.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/[0.06]">
          <TaxInternationalDuty />
        </div>
      </main>
    </div>
  );
}
