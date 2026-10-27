import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, IndianRupee, HeartPulse, Clock, Sparkles } from 'lucide-react';

interface AnalysisResult {
  verdict: 'LIKELY_GENUINE' | 'SUSPICIOUS' | 'REQUIRES_HUMAN_REVIEW';
  risk_score: number;
  confidence: number;
  risk_level: string;
  insights: string[];
  explanation: string;
  claim_amount?: number;
}

interface AnalysisCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="neo-surface p-8 h-full flex flex-col justify-center items-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-6"
        >
          <Sparkles size={48} className="text-[#FACC15]" />
        </motion.div>
        <h3 className="text-xl font-bold text-[#172554] mb-2">Analyzing claim...</h3>
        <p className="text-[#64748B] mb-1">Checking financial patterns...</p>
        <p className="text-[#64748B] mb-1">Checking medical consistency...</p>
        <p className="text-[#64748B]">Generating explanation...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="neo-surface p-8 h-full flex flex-col justify-center items-center text-center">
        <div className="w-20 h-20 rounded-full neo-inset flex items-center justify-center mb-6">
          <Sparkles size={32} className="text-[#64748B]" />
        </div>
        <h3 className="text-xl font-bold text-[#172554] mb-2">No Claim Analyzed Yet</h3>
        <p className="text-[#64748B] max-w-sm">Enter the claim details on the left and click "Analyze Claim" to see the AI verdict, risk score, and insights.</p>
      </div>
    );
  }

  const isGenuine = result.verdict === 'LIKELY_GENUINE';
  const isSuspicious = result.verdict === 'SUSPICIOUS';

  let verdictColor = '#22C55E';
  let verdictBg = 'rgba(34, 197, 94, 0.1)';
  let VerdictIcon = CheckCircle2;
  let verdictTitle = 'Likely Genuine';
  let verdictSub = 'This claim appears to be legitimate based on the provided information.';

  if (isSuspicious) {
    verdictColor = '#EF4444';
    verdictBg = 'rgba(239, 68, 68, 0.1)';
    VerdictIcon = XCircle;
    verdictTitle = 'Suspicious Claim';
    verdictSub = 'This claim exhibits multiple high-risk anomalies.';
  } else if (!isGenuine && !isSuspicious) {
    verdictColor = '#F59E0B';
    verdictBg = 'rgba(245, 158, 11, 0.1)';
    VerdictIcon = AlertTriangle;
    verdictTitle = 'Requires Human Review';
    verdictSub = 'Insufficient or conflicting evidence requires manual verification.';
  }

  // Risk Score Color
  const getRiskColor = (score: number) => {
    if (score <= 30) return '#22C55E';
    if (score <= 60) return '#FACC15';
    if (score <= 80) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-surface p-6 sm:p-8 h-full flex flex-col overflow-y-auto border border-[var(--color-border)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Predictive Fraud Assessment</h2>
          <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">Scikit-Learn Random Forest probabilistic inference</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Model Confidence</div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
            <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">{result.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Verdict Container */}
      <div className="rounded-xl p-4 sm:p-5 mb-6 flex items-center justify-between border" style={{ backgroundColor: verdictBg, borderColor: `${verdictColor}40` }}>
        <div className="flex gap-3.5 items-center">
          <VerdictIcon size={28} color={verdictColor} className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold" style={{ color: verdictColor }}>{verdictTitle}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 font-medium">{verdictSub}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: verdictColor }}>Risk Level</div>
          <div className="text-base font-extrabold" style={{ color: verdictColor }}>{result.risk_level}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center">
          <IndianRupee className="mx-auto mb-1 text-slate-500" size={18} />
          <div className="text-xs font-bold text-[var(--color-text-primary)]">Billing Tier</div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{result.insights[0] || 'Verified'}</div>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center">
          <HeartPulse className="mx-auto mb-1 text-slate-500" size={18} />
          <div className="text-xs font-bold text-[var(--color-text-primary)]">Consistency</div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{result.insights[1] || 'Compliant'}</div>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center">
          <Clock className="mx-auto mb-1 text-slate-500" size={18} />
          <div className="text-xs font-bold text-[var(--color-text-primary)]">Filing Timeline</div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{result.insights[result.insights.length-1] || 'On Schedule'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {/* Risk Score Gauge */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
          <div className="relative w-28 h-28 flex items-center justify-center mb-2">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="46" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="10" />
              <motion.circle 
                cx="56" cy="56" r="46" 
                fill="none" 
                stroke={getRiskColor(result.risk_score)} 
                strokeWidth="10"
                strokeDasharray="289.02"
                initial={{ strokeDashoffset: 289.02 }}
                animate={{ strokeDashoffset: 289.02 - (289.02 * result.risk_score) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-2xl font-black font-mono text-[var(--color-text-primary)]">{result.risk_score}</div>
              <div className="text-[9px] uppercase font-bold text-[var(--color-text-secondary)]">Risk %</div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Fraud Likelihood</span>
        </div>

        {/* Key Insights List */}
        <div className="sm:col-span-2 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-2.5 pb-1 border-b border-[var(--color-border)]">
            Algorithmic Findings
          </h4>
          <ul className="space-y-2">
            {result.insights.map((insight, idx) => {
              const isWarning = insight.includes('unusual') || insight.includes('higher') || insight.includes('verification');
              return (
                <li key={idx} className="flex gap-2 items-start text-xs font-medium">
                  {isWarning ? (
                    <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <span className={isWarning ? 'text-[var(--color-text-primary)] font-semibold' : 'text-[var(--color-text-secondary)]'}>
                    {insight}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Model Explanation */}
      <div className="mb-4 p-4 bg-slate-900 text-white rounded-xl border border-slate-700">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles size={14} /> AI Diagnostic Summary
        </h4>
        <p className="text-xs leading-relaxed text-slate-200 font-medium">
          {result.explanation}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-auto bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium text-amber-900 dark:text-amber-200">
          Automated clinical decision support recommendation. Requires human adjudicator authorization before adjudication action.
        </p>
      </div>
    </motion.div>
  );
};

