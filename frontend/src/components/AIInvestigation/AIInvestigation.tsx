import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, FileCheck, CheckSquare, Sparkles } from 'lucide-react';
import { EvidenceSources } from './EvidenceSources';
import { RiskFactors } from './RiskFactors';
import { AIChat } from './AIChat';

export interface InvestigationData {
  ml_prediction: {
    is_fraudulent: boolean;
    fraud_probability: number;
    verdict: string;
    risk_score: number;
    risk_level: string;
    confidence: number;
    insights: string[];
  };
  retrieved_context: Array<{
    document: string;
    filename: string;
    section: string;
    score: number;
  }>;
  ai_analysis: {
    summary: string;
    risk_level: string;
    fraud_probability: number;
    key_risk_factors: string[];
    claim_analysis: string;
    supporting_evidence: Array<{
      source: string;
      relevance: string;
      text: string;
    }>;
    recommended_investigation_steps: string[];
    limitations: string[];
  };
}

interface AIInvestigationProps {
  data: InvestigationData | null;
  claimPayload: any;
  isLoading: boolean;
}

export const AIInvestigation: React.FC<AIInvestigationProps> = ({ data, claimPayload, isLoading }) => {
  if (isLoading) {
    return (
      <div className="neo-surface p-8 rounded-2xl text-center flex flex-col justify-center items-center py-16">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mb-4 text-[#F59E0B]"
        >
          <Sparkles size={48} />
        </motion.div>
        <h3 className="text-xl font-bold text-[#172554] mb-2">Running RAG + LLM Investigation Pipeline...</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Step 1: Running ML Prediction Model &nbsp;➔&nbsp; Step 2: Retrieving Knowledge Base Evidence &nbsp;➔&nbsp; Step 3: NVIDIA LLM Analysis
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { ml_prediction, retrieved_context, ai_analysis } = data;
  const probPercent = Math.round((ai_analysis?.fraud_probability || ml_prediction?.fraud_probability || (ml_prediction?.risk_score / 100)) * 100);
  
  let riskBadgeColor = 'bg-emerald-500 text-white';
  if (probPercent >= 65) riskBadgeColor = 'bg-red-600 text-white';
  else if (probPercent >= 35) riskBadgeColor = 'bg-amber-500 text-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 mt-8"
    >
      {/* Header Banner */}
      <div className="neo-surface p-6 rounded-2xl bg-gradient-to-r from-[#172554] to-[#1e3a8a] text-white shadow-xl relative overflow-hidden">
        <Sparkles className="absolute right-4 bottom-2 text-white/10" size={140} />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#FACC15] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={16} /> AI-Powered Investigation System Report (RAG + NVIDIA LLM)
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Claim Audit & Decision Support Report</h2>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              Grounded in machine-learning probability and verified healthcare insurance knowledge base documents.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#FACC15]">Fraud Risk Score</div>
              <div className="text-3xl font-black">{probPercent}%</div>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${riskBadgeColor}`}>
              {ai_analysis?.risk_level || ml_prediction?.risk_level} Risk
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Analysis Report, Right AI Chat & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Fraud Prediction, AI Risk Summary, Key Risk Factors, Evidence */}
        <div className="lg:col-span-7 space-y-6">
          {/* ML Prediction & Fraud Probability */}
          <div className="neo-surface p-6 rounded-2xl border-l-4 border-l-[#172554]">
            <h3 className="text-base font-bold text-[#172554] mb-3 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#172554]" /> Primary ML Fraud Model Prediction
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#EEF3FA] p-3 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold mb-1">Fraud Probability</div>
                <div className="text-xl font-bold text-[#172554]">{probPercent}%</div>
              </div>
              <div className="bg-[#EEF3FA] p-3 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold mb-1">ML Status</div>
                <div className="text-sm font-bold text-[#172554]">{ml_prediction?.verdict?.replace(/_/g, ' ')}</div>
              </div>
              <div className="bg-[#EEF3FA] p-3 rounded-xl">
                <div className="text-xs text-slate-500 font-semibold mb-1">Confidence Score</div>
                <div className="text-xl font-bold text-[#172554]">{ml_prediction?.confidence}%</div>
              </div>
            </div>
          </div>

          {/* AI Risk Summary */}
          <div className="neo-surface p-6 rounded-2xl">
            <h3 className="text-base font-bold text-[#172554] mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-[#F59E0B]" /> Executive AI Risk Summary
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-amber-50/60 p-4 rounded-xl border border-amber-200/60">
              {ai_analysis?.summary}
            </p>
          </div>

          {/* Key Risk Factors */}
          <div className="neo-surface p-6 rounded-2xl">
            <RiskFactors factors={ai_analysis?.key_risk_factors || ml_prediction?.insights} />
          </div>

          {/* Detailed Claim Analysis */}
          {ai_analysis?.claim_analysis && (
            <div className="neo-surface p-6 rounded-2xl space-y-2">
              <h3 className="text-base font-bold text-[#172554] flex items-center gap-2">
                <FileCheck size={18} className="text-[#172554]" /> Clinical & Billing Anomaly Breakdown
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {ai_analysis.claim_analysis}
              </p>
            </div>
          )}

          {/* Evidence RAG Sources */}
          <div className="neo-surface p-6 rounded-2xl">
            <EvidenceSources sources={retrieved_context} />
          </div>
        </div>

        {/* Right Column (5 cols): Investigation Checklist & AI Chatbot */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recommended Investigation Steps */}
          {ai_analysis?.recommended_investigation_steps && (
            <div className="neo-surface p-6 rounded-2xl border-t-4 border-t-[#F59E0B]">
              <h4 className="text-sm font-bold text-[#172554] uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckSquare size={18} className="text-[#F59E0B]" />
                Recommended Investigation Checklist
              </h4>
              <ul className="space-y-2.5">
                {ai_analysis.recommended_investigation_steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 items-start text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input type="checkbox" className="mt-0.5 rounded text-[#172554] focus:ring-[#172554]" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Limitations Notice */}
          {ai_analysis?.limitations && ai_analysis.limitations.length > 0 && (
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-700">
                <AlertCircle size={14} className="text-amber-500" /> Investigation Scope Limitations:
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                {ai_analysis.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive AI Chatbot */}
          <AIChat claimData={claimPayload} />
        </div>
      </div>
    </motion.div>
  );
};
