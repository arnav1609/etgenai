/**
 * TaxDisclaimer.jsx
 * Persistent disclaimer strip shown on results + insights screens.
 */
import { AlertTriangle } from "lucide-react";

export default function TaxDisclaimer() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-amber-400/80">
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-xs leading-relaxed">
        <span className="font-semibold text-amber-400">Disclaimer: </span>
        Tax calculations are estimates based on publicly available rules for FY&nbsp;2025–26.
        This tool does not account for all exemptions, special provisions, or individual
        circumstances. Please consult a Chartered Accountant (CA) for complex situations.
        Results do not constitute tax filing or legal advice.
      </p>
    </div>
  );
}
