import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Cpu, 
  Target, 
  Award, 
  Activity, 
  Info
} from 'lucide-react';
import { 
  MOCK_MODEL_METRICS, 
  MOCK_PROBABILITY_BINS
} from '../../data/mockData';

export const AnalyticsPage: React.FC = () => {
  const { accuracy, precision, recall, f1_score, auc_roc, total_test_samples, confusion_matrix, features } = MOCK_MODEL_METRICS;
  const { tp, fp, fn, tn } = confusion_matrix;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#172554] text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu size={14} /> Model Intelligence & Evaluation Benchmarks
          </div>
          <h2 className="text-2xl font-bold text-[#172554] tracking-tight">Fraud Analytics & Detection Performance</h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
            Quantitative diagnostic evaluation of the Scikit-Learn Random Forest Classifier and statistical distribution of fraud probability outputs.
          </p>
        </div>
        <div className="bg-white/80 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm text-xs font-mono text-slate-700">
          <span className="font-bold text-[#172554]">Artifact:</span> rf_claim_fraud_model.joblib
        </div>
      </div>

      {/* Model Benchmark Performance Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider flex items-center gap-2">
            <Award size={16} className="text-[#FACC15]" />
            Supervised Random Forest Benchmark Metrics (Holdout Test Set)
          </h3>
          <span className="text-xs text-slate-400 font-mono">N = {total_test_samples.toLocaleString()} test claims</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="neo-surface p-4 border border-white/70">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Accuracy</p>
            <p className="text-2xl font-extrabold text-[#172554] mt-1">{(accuracy * 100).toFixed(1)}%</p>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Overall correct classifications</p>
          </div>

          <div className="neo-surface p-4 border border-white/70">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Precision</p>
            <p className="text-2xl font-extrabold text-[#172554] mt-1">{(precision * 100).toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">TP / (TP + FP)</p>
          </div>

          <div className="neo-surface p-4 border border-white/70">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Recall (Sensitivity)</p>
            <p className="text-2xl font-extrabold text-[#172554] mt-1">{(recall * 100).toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">TP / (TP + FN)</p>
          </div>

          <div className="neo-surface p-4 border border-white/70">
            <p className="text-[11px] font-bold text-slate-500 uppercase">F1-Score</p>
            <p className="text-2xl font-extrabold text-[#172554] mt-1">{(f1_score * 100).toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Harmonic mean P & R</p>
          </div>

          <div className="neo-surface p-4 border border-white/70 col-span-2 md:col-span-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase">ROC - AUC</p>
            <p className="text-2xl font-extrabold text-[#1e3a8a] mt-1">{auc_roc.toFixed(3)}</p>
            <p className="text-[10px] text-blue-600 mt-1 font-semibold">High discrimination power</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & Probability Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-surface p-6 border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172554]">Empirical Confusion Matrix</h3>
              <p className="text-xs text-[#64748B]">2x2 Contingency table on holdout ground-truth test partition</p>
            </div>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <Target size={18} />
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">True Positive (TP)</p>
                <p className="text-3xl font-extrabold text-emerald-700 mt-1">{tp}</p>
                <p className="text-[11px] text-emerald-900 mt-1 font-medium">Fraudulent claims accurately intercepted</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">False Positive (FP)</p>
                <p className="text-3xl font-extrabold text-amber-700 mt-1">{fp}</p>
                <p className="text-[11px] text-amber-900 mt-1 font-medium">Legitimate claims flagged for audit review</p>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">False Negative (FN)</p>
                <p className="text-3xl font-extrabold text-rose-700 mt-1">{fn}</p>
                <p className="text-[11px] text-rose-900 mt-1 font-medium">Fraudulent claims missed (Target for SIU)</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">True Negative (TN)</p>
                <p className="text-3xl font-extrabold text-blue-700 mt-1">{tn}</p>
                <p className="text-[11px] text-blue-900 mt-1 font-medium">Compliant claims cleared automatically</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info size={16} className="text-[#172554] shrink-0 mt-0.5" />
            <span>
              The low False Positive rate minimizes unnecessary operational friction for genuine patient claims, while high sensitivity ({ (recall * 100).toFixed(1)}%) captures fraud schemes effectively.
            </span>
          </div>
        </div>

        <div className="neo-surface p-6 border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172554]">Fraud Probability Distribution</h3>
              <p className="text-xs text-[#64748B]">Binned probability output scores across 1,284 evaluated claims</p>
            </div>
            <span className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <Activity size={18} />
            </span>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PROBABILITY_BINS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#172554', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Claim Count" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Peak concentration: 0 - 20% (Compliant cohort)</span>
            <span className="font-semibold text-red-600">High-risk outlier tail: 80 - 100%</span>
          </div>
        </div>
      </div>

      {/* Feature Importance Section */}
      <div className="neo-surface p-6 border border-white/70">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#172554]">Random Forest Feature Importance Weights</h3>
          <p className="text-xs text-[#64748B]">Gini impurity reduction ranking identifying the strongest predictive drivers of claim fraud</p>
        </div>

        <div className="space-y-3.5">
          {features.map((feature, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>{feature.name}</span>
                <span className="font-mono text-[#172554]">{(feature.importance * 100).toFixed(0)}% contribution</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#172554] to-[#3b82f6] h-full rounded-full transition-all duration-500"
                  style={{ width: `${feature.importance * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
