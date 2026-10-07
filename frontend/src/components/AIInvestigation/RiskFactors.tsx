import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RiskFactorsProps {
  factors: string[];
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({ factors }) => {
  if (!factors || factors.length === 0) {
    return (
      <div className="p-3 bg-slate-50 text-slate-500 rounded-xl text-xs">
        No specific high-risk indicators detected.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-[#172554] uppercase tracking-wider flex items-center gap-2">
        <ShieldAlert size={18} className="text-[#EF4444]" />
        Key Risk Factors ({factors.length})
      </h4>
      <div className="space-y-2">
        {factors.map((factor, idx) => {
          const isSevere = factor.toLowerCase().includes('high') || factor.toLowerCase().includes('unusual') || factor.toLowerCase().includes('significant');
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl flex items-start gap-3 text-xs font-semibold ${
                isSevere
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {isSevere ? (
                <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{factor}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
