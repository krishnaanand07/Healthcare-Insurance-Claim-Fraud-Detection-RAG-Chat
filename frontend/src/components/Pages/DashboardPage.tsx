import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  FilePlus, 
  ArrowUpRight, 
  Clock, 
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  MOCK_CLAIMS, 
  MOCK_MONTHLY_TRENDS, 
  MOCK_RISK_DISTRIBUTION 
} from '../../data/mockData';

interface DashboardPageProps {
  onNavigate: (tab: 'dashboard' | 'new-claim' | 'history' | 'analytics' | 'providers' | 'reports') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const highRiskClaims = MOCK_CLAIMS.filter(c => c.risk_level === 'High');
  const totalClaims = 1284;
  const fraudClaims = 190;
  const legitClaims = 1094;
  const reviewClaims = 38;
  const fraudRate = ((fraudClaims / totalClaims) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563eb] text-white rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide text-[#FACC15] mb-2">
            <ShieldAlert size={14} /> LIVE FRAUD MONITORING
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Claims Intelligence & Fraud Triage</h2>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Continuous automated screening of healthcare claims using Random Forest predictive scoring and evidence-backed clinical RAG investigation.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('new-claim')}
            className="flex items-center gap-2 bg-[#FACC15] hover:bg-[#eab308] text-[#172554] font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] text-sm cursor-pointer"
          >
            <FilePlus size={18} />
            <span>New Claim Investigation</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl transition-all border border-white/20 text-sm cursor-pointer"
          >
            <Clock size={16} />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="neo-surface p-5 border border-white/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Processed</p>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#172554]">{totalClaims.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+12.4%</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2 font-medium">All claims submitted across networks</p>
        </div>

        <div className="neo-surface p-5 border border-white/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Flagged Fraud</p>
            <span className="p-2 rounded-xl bg-red-100 text-red-600">
              <ShieldAlert size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#EF4444]">{fraudClaims}</span>
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">{fraudRate}% Rate</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2 font-medium">High-confidence fraudulent anomalies</p>
        </div>

        <div className="neo-surface p-5 border border-white/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Legitimate Claims</p>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#172554]">{legitClaims.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">85.2%</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2 font-medium">Verified compliant for automated payout</p>
        </div>

        <div className="neo-surface p-5 border border-white/70 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">High-Risk Pending</p>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F59E0B]">{reviewClaims}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Requires SIU</span>
          </div>
          <p className="text-xs text-[#64748B] mt-2 font-medium">Special Investigation Unit active queue</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 neo-surface p-6 border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#172554]">Monthly Claims Volume & Fraud Trends</h3>
              <p className="text-xs text-[#64748B]">Comparison of overall claim admissions vs confirmed flagged fraud</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span>
                <span className="text-[#64748B]">Total Claims</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
                <span className="text-[#64748B]">Flagged Fraud</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MONTHLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalClaimsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#172554', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" name="Total Claims" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#totalClaimsGrad)" />
                <Area type="monotone" dataKey="fraudulent" name="Fraud Claims" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#fraudGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neo-surface p-6 border border-white/70 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172554]">Fraud Risk Distribution</h3>
            <p className="text-xs text-[#64748B] mb-2">Risk severity stratification of claims pool</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_RISK_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MOCK_RISK_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#172554', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-[#64748B] font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 mt-2 flex items-center justify-between">
            <span className="font-semibold">High-Risk Severity:</span>
            <span className="font-bold text-red-600">14.8% of portfolio</span>
          </div>
        </div>
      </div>

      {/* Recent High-Risk Claims Triage Table */}
      <div className="neo-surface p-6 border border-white/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-[#172554] flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              Recent High-Risk Claims Requiring Action
            </h3>
            <p className="text-xs text-[#64748B]">
              Priority triage list generated by the Random Forest classifier based on anomalous clinical/billing patterns
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-[#1e3a8a] hover:text-[#2563eb] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            View all claims in History <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-[#64748B] uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Claim ID</th>
                <th className="p-3.5">Patient</th>
                <th className="p-3.5">Provider Hospital</th>
                <th className="p-3.5">Diagnosis & CPT</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Fraud Prob.</th>
                <th className="p-3.5 text-center">Risk Status</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {highRiskClaims.slice(0, 4).map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-[#172554]">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">{claim.claim_id}</span>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-semibold">{claim.patient_id}</div>
                    <div className="text-[10px] text-slate-400">Age {claim.age} • {claim.gender}</div>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-semibold">{claim.hospital_name}</div>
                    <div className="text-[10px] text-slate-400">{claim.provider_patient_distance} mi away</div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="font-semibold text-slate-800">{claim.diagnosis_code} ({claim.procedure_code})</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{claim.diagnosis_desc}</div>
                  </td>
                  <td className="p-3.5 text-right font-bold text-[#172554]">
                    ${claim.claim_amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs bg-red-100 text-red-700">
                      {(claim.fraud_probability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onNavigate('new-claim')}
                      className="inline-flex items-center gap-1 bg-[#172554] hover:bg-[#1e3a8a] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <span>Investigate</span>
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
          <span>* High-risk cases are automatically escalated for full RAG evidence synthesis.</span>
          <span className="text-[11px] font-mono">Model Version: RF-Classifier v2.0</span>
        </div>
      </div>
    </div>
  );
};
