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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-surface p-8 h-full flex flex-col overflow-y-auto custom-scrollbar"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#172554] mb-1">AI Analysis Result</h2>
          <p className="text-[#64748B] text-sm">Our model has analyzed the claim based on multiple risk factors.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-[#172554] mb-1">Confidence</div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 bg-[#EEF3FA] rounded-full overflow-hidden neo-inset">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                className="h-full bg-gradient-to-r from-[#172554] to-[#52658F]"
              />
            </div>
            <span className="text-sm font-bold text-[#172554]">{result.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Verdict Container */}
      <div className="rounded-2xl p-6 mb-8 flex items-center justify-between shadow-inner" style={{ backgroundColor: verdictBg, border: `1px solid ${verdictColor}30` }}>
        <div className="flex gap-4 items-center">
          <VerdictIcon size={32} color={verdictColor} />
          <div>
            <h3 className="text-xl font-bold" style={{ color: verdictColor }}>{verdictTitle}</h3>
            <p className="text-sm text-[#172554]/70 mt-1 font-medium">{verdictSub}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider font-bold" style={{ color: verdictColor }}>Risk Level</div>
          <div className="text-lg font-bold" style={{ color: verdictColor }}>{result.risk_level}</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="neo-surface p-4 text-center">
          <IndianRupee className="mx-auto mb-2 text-[#52658F]" size={24} />
          <div className="text-lg font-bold text-[#172554]">Amount</div>
          <div className="text-xs font-medium text-[#64748B] mt-1">{result.insights[0] || 'Checked'}</div>
        </div>
        <div className="neo-surface p-4 text-center">
          <HeartPulse className="mx-auto mb-2 text-[#52658F]" size={24} />
          <div className="text-lg font-bold text-[#172554]">Consistency</div>
          <div className="text-xs font-medium text-[#64748B] mt-1">{result.insights[1] || 'Checked'}</div>
        </div>
        <div className="neo-surface p-4 text-center">
          <Clock className="mx-auto mb-2 text-[#52658F]" size={24} />
          <div className="text-lg font-bold text-[#172554]">Timing</div>
          <div className="text-xs font-medium text-[#64748B] mt-1">{result.insights[result.insights.length-1] || 'Checked'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Risk Score Circle */}
        <div className="col-span-1 flex flex-col items-center justify-center neo-inset p-6 rounded-2xl">
          <div className="relative w-32 h-32 flex items-center justify-center neo-surface rounded-full mb-4">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="54" fill="none" stroke="#EEF3FA" strokeWidth="12" />
              <motion.circle 
                cx="64" cy="64" r="54" 
                fill="none" 
                stroke={getRiskColor(result.risk_score)} 
                strokeWidth="12"
                strokeDasharray="339.292"
                initial={{ strokeDashoffset: 339.292 }}
                animate={{ strokeDashoffset: 339.292 - (339.292 * result.risk_score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-3xl font-black text-[#172554]">{result.risk_score}</div>
              <div className="text-[10px] uppercase font-bold text-[#64748B]">Score</div>
            </div>
          </div>
        </div>

        {/* Key Insights List */}
        <div className="col-span-2">
          <h4 className="text-sm font-bold text-[#172554] uppercase tracking-wider mb-4 pb-2 border-b border-[#172554]/10">Key Insights</h4>
          <ul className="space-y-3">
            {result.insights.map((insight, idx) => {
              const isWarning = insight.includes('unusual') || insight.includes('higher') || insight.includes('verification');
              return (
                <li key={idx} className="flex gap-3 items-start text-sm font-medium">
                  {isWarning ? (
                    <AlertTriangle size={18} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
                  )}
                  <span className={isWarning ? 'text-[#172554]' : 'text-[#64748B]'}>{insight}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Gemini Explanation */}
      <div className="mb-6 p-5 bg-[#172554] text-white rounded-2xl shadow-xl relative overflow-hidden">
        <Sparkles className="absolute -right-4 -bottom-4 text-white/10" size={100} />
        <h4 className="text-sm font-bold text-[#FACC15] uppercase tracking-wider mb-2 flex items-center gap-2">
          <Sparkles size={16} /> Gemini AI Summary
        </h4>
        <p className="text-sm leading-relaxed text-white/90 relative z-10 font-medium">
          {result.explanation}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-auto bg-[#FACC15]/20 border border-[#FACC15]/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-[#F59E0B] shrink-0" />
        <p className="text-xs font-semibold text-[#172554]/80">
          This is an AI-assisted analysis. Please review critical cases manually. The system is designed to support an insurance analyst, not make independent irreversible decisions.
        </p>
      </div>
    </motion.div>
  );
};
