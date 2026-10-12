import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Stethoscope, 
  X, 
  Eye, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { MOCK_PROVIDERS, ProviderRecord } from '../../data/mockData';

interface ProvidersPageProps {
  onNavigate: (tab: 'dashboard' | 'new-claim' | 'history' | 'analytics' | 'providers' | 'reports') => void;
}

export const ProvidersPage: React.FC<ProvidersPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedProvider, setSelectedProvider] = useState<ProviderRecord | null>(null);

  const specialties = Array.from(new Set(MOCK_PROVIDERS.map(p => p.specialty)));

  const filteredProviders = MOCK_PROVIDERS.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provider_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty = specialtyFilter === 'ALL' || p.specialty === specialtyFilter;
    const matchesRisk = riskFilter === 'ALL' || p.risk_level === riskFilter;

    return matchesSearch && matchesSpecialty && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#172554] tracking-tight">Healthcare Providers Anomaly Screening</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Directory of affiliated medical providers and facilities with statistical claim pattern outlier screening.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-amber-900 text-xs flex items-center gap-2">
          <Info size={16} className="text-amber-600 shrink-0" />
          <span className="font-semibold">Screening signals are statistical indicators, not confirmed fraud.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-surface p-4 border border-white/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Monitored Providers</p>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Users size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#172554] mt-2">342</p>
          <p className="text-[11px] text-slate-500 mt-1">Active registered billing facilities</p>
        </div>

        <div className="neo-surface p-4 border border-white/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Elevated Anomaly Screening</p>
            <span className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#EF4444] mt-2">14</p>
          <p className="text-[11px] text-red-600 mt-1 font-semibold">Flagged for periodic audit review</p>
        </div>

        <div className="neo-surface p-4 border border-white/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Avg Claim / Provider</p>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 size={16} />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[#172554] mt-2">$28,450</p>
          <p className="text-[11px] text-slate-500 mt-1">Mean reimbursement volume per case</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="neo-surface p-4 border border-white/70 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search provider name, NPI/ID, hospital, or city..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Specialties</option>
            {specialties.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="Elevated">Elevated Signal</option>
            <option value="Moderate">Moderate Signal</option>
            <option value="Normal">Normal Baseline</option>
          </select>
        </div>
      </div>

      {/* Provider Directory Table */}
      <div className="neo-surface p-5 border border-white/70">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-[#64748B] uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Provider ID</th>
                <th className="p-3.5">Physician / Lead</th>
                <th className="p-3.5">Facility & City</th>
                <th className="p-3.5">Specialty</th>
                <th className="p-3.5 text-center">Total Claims</th>
                <th className="p-3.5 text-center">Flagged Rate</th>
                <th className="p-3.5 text-right">Avg Claim</th>
                <th className="p-3.5 text-center">Screening Signal</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {filteredProviders.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-[#172554]">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">{p.provider_id}</span>
                  </td>
                  <td className="p-3.5 text-slate-800">
                    <span className="font-semibold block">{p.name}</span>
                    <span className="text-[10px] text-slate-400">{p.type}</span>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <span className="font-semibold block">{p.facility_name}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin size={10} /> {p.city}, {p.state}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium">
                      <Stethoscope size={11} /> {p.specialty}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-700">
                    {p.total_claims}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded font-bold text-xs ${
                      p.anomaly_rate > 14 
                        ? 'bg-red-100 text-red-700' 
                        : p.anomaly_rate > 8 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.anomaly_rate}% ({p.flagged_claims})
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-[#172554]">
                    ${p.avg_claim_amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      p.risk_level === 'Elevated'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : p.risk_level === 'Moderate'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {p.risk_level}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedProvider(p)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative border border-slate-200 animate-fadeIn">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-[#172554]">
                    {selectedProvider.provider_id}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    selectedProvider.risk_level === 'Elevated' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {selectedProvider.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#172554] mt-2">{selectedProvider.name}</h3>
                <p className="text-xs text-slate-500">{selectedProvider.facility_name} • {selectedProvider.city}, {selectedProvider.state}</p>
              </div>
              <button 
                onClick={() => setSelectedProvider(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Total Claims</p>
                  <p className="text-lg font-bold text-[#172554]">{selectedProvider.total_claims}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Flagged Claims</p>
                  <p className="text-lg font-bold text-red-600">{selectedProvider.flagged_claims}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Anomaly Rate</p>
                  <p className="text-lg font-bold text-[#172554]">{selectedProvider.anomaly_rate}%</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-700">Specialty & Diagnosis Focus</p>
                <p className="text-slate-600"><span className="text-slate-400">Primary Specialty:</span> {selectedProvider.specialty}</p>
                <p className="text-slate-600"><span className="text-slate-400">High-Volume Diagnosis:</span> {selectedProvider.primary_diagnosis}</p>
                <p className="text-slate-600"><span className="text-slate-400">Average Claim Value:</span> ${selectedProvider.avg_claim_amount.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-600" />
                  Screening Anomaly Assessment Notes
                </p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Statistical metrics flag a higher proportion of multi-procedure bundled claims than the regional specialty benchmark. Recommend standard chart review on 5 random claims prior to next payment cycle.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  onNavigate('history');
                }}
                className="px-4 py-2 bg-[#172554] text-white rounded-xl font-bold hover:bg-[#1e3a8a] cursor-pointer"
              >
                Inspect Claims in History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
