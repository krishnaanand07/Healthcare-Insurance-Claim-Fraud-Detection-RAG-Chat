import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  AlertCircle, 
  Eye, 
  X, 
  ArrowUpDown, 
  ExternalLink
} from 'lucide-react';
import { MOCK_CLAIMS, ClaimRecord } from '../../data/mockData';

interface ClaimHistoryPageProps {
  onNavigate: (tab: 'dashboard' | 'new-claim' | 'history' | 'analytics' | 'providers' | 'reports') => void;
}

export const ClaimHistoryPage: React.FC<ClaimHistoryPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'risk'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);

  const pageSize = 6;

  // Filter logic
  const filteredClaims = MOCK_CLAIMS.filter(claim => {
    const matchesSearch = 
      claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.diagnosis_code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || claim.risk_level === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Sort logic
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.service_date).getTime() - new Date(b.service_date).getTime();
    } else if (sortBy === 'amount') {
      comparison = a.claim_amount - b.claim_amount;
    } else if (sortBy === 'risk') {
      comparison = a.fraud_probability - b.fraud_probability;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const totalPages = Math.ceil(sortedClaims.length / pageSize) || 1;
  const paginatedClaims = sortedClaims.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'date' | 'amount' | 'risk') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#172554] tracking-tight">Claim Audit History</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Search, filter, and inspect previously submitted healthcare claims, risk scores, and clinical findings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('new-claim')}
            className="flex items-center gap-1.5 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <FileText size={16} />
            <span>Process New Claim</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="neo-surface p-4 border border-white/70 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by Claim ID, Patient ID, Hospital, or Diagnosis..."
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#172554]/20"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Fraudulent">Fraudulent</option>
            <option value="Legitimate">Legitimate</option>
            <option value="Under Review">Under Review</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="High">High Risk (&gt;70%)</option>
            <option value="Medium">Medium Risk (40-70%)</option>
            <option value="Low">Low Risk (&lt;40%)</option>
          </select>
        </div>
      </div>

      {/* Claims Table */}
      <div className="neo-surface p-5 border border-white/70">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-[#64748B]">
            Showing <span className="text-[#172554]">{paginatedClaims.length}</span> of <span className="text-[#172554]">{sortedClaims.length}</span> claims
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Sort by:</span>
            <button
              onClick={() => toggleSort('date')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                sortBy === 'date' ? 'bg-[#172554] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Date <ArrowUpDown size={12} />
            </button>
            <button
              onClick={() => toggleSort('amount')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                sortBy === 'amount' ? 'bg-[#172554] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Amount <ArrowUpDown size={12} />
            </button>
            <button
              onClick={() => toggleSort('risk')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                sortBy === 'risk' ? 'bg-[#172554] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Fraud Score <ArrowUpDown size={12} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-[#64748B] uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Claim ID</th>
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Provider Hospital</th>
                <th className="p-3.5">Diagnosis Code</th>
                <th className="p-3.5 text-right">Claim Amount</th>
                <th className="p-3.5 text-center">Fraud Probability</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Service Date</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium">
              {paginatedClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    No claims match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-[#172554]">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">{claim.claim_id}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="font-semibold">{claim.patient_id}</span>
                      <span className="text-[10px] text-slate-400 block">{claim.gender}, {claim.age}y</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="font-semibold">{claim.hospital_name}</span>
                      <span className="text-[10px] text-slate-400 block">{claim.provider_patient_distance} miles away</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="font-mono font-bold text-slate-800">{claim.diagnosis_code}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">{claim.diagnosis_desc}</span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-[#172554]">
                      ${claim.claim_amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded font-bold text-xs ${
                          claim.fraud_probability > 0.7 
                            ? 'bg-red-100 text-red-700' 
                            : claim.fraud_probability > 0.35 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {(claim.fraud_probability * 100).toFixed(0)}%
                        </span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              claim.fraud_probability > 0.7 
                                ? 'bg-red-500' 
                                : claim.fraud_probability > 0.35 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${claim.fraud_probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        claim.status === 'Fraudulent'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : claim.status === 'Under Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {claim.service_date}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-[#172554] hover:text-white text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-200 text-xs">
          <p className="text-slate-500">
            Page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  currentPage === page 
                    ? 'bg-[#172554] text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative border border-slate-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-[#172554]">
                    {selectedClaim.claim_id}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    selectedClaim.status === 'Fraudulent' 
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : selectedClaim.status === 'Under Review'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {selectedClaim.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#172554] mt-2">Claim Assessment Dossier</h3>
                <p className="text-xs text-slate-500">Service Date: {selectedClaim.service_date} • Policy: {selectedClaim.policy_number}</p>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-5 text-xs">
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Claim Amount</p>
                  <p className="text-lg font-extrabold text-[#172554]">${selectedClaim.claim_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Fraud Probability</p>
                  <p className={`text-lg font-extrabold ${selectedClaim.fraud_probability > 0.7 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {(selectedClaim.fraud_probability * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Risk Level</p>
                  <p className="text-lg font-extrabold text-[#172554]">{selectedClaim.risk_level}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-700 mb-2">Patient Profile</p>
                  <p className="text-slate-600"><span className="text-slate-400">ID:</span> {selectedClaim.patient_id}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Demographics:</span> {selectedClaim.gender}, {selectedClaim.age} years</p>
                  <p className="text-slate-600"><span className="text-slate-400">Prior Claims:</span> {selectedClaim.num_previous_claims_patient}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Distance to Facility:</span> {selectedClaim.provider_patient_distance} miles</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-700 mb-2">Provider & Hospital</p>
                  <p className="text-slate-600"><span className="text-slate-400">Facility:</span> {selectedClaim.hospital_name}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Hospital ID:</span> {selectedClaim.hospital_id}</p>
                  <p className="text-slate-600"><span className="text-slate-400">Admission:</span> {selectedClaim.admission_type} ({selectedClaim.service_type})</p>
                  <p className="text-slate-600"><span className="text-slate-400">Length of Stay:</span> {selectedClaim.length_of_stay} days</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-2">Clinical Coding & Procedures</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                      ICD-10: {selectedClaim.diagnosis_code}
                    </span>
                    <span className="text-slate-700">{selectedClaim.diagnosis_desc}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded text-[11px] font-bold">
                      CPT: {selectedClaim.procedure_code}
                    </span>
                    <span className="text-slate-700">{selectedClaim.procedure_desc}</span>
                  </div>
                  <p className="text-slate-500 pt-1">Total Procedures Coded: {selectedClaim.num_procedures} • Late Submission: {selectedClaim.claim_submitted_late ? 'Yes (Delayed)' : 'No'}</p>
                </div>
              </div>

              {selectedClaim.flagged_reasons && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <p className="font-bold text-red-900 mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-red-600" />
                    Detected Risk Factors & Anomaly Flags
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-red-800">
                    {selectedClaim.flagged_reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Evaluated via Random Forest Model + RAG</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedClaim(null);
                    onNavigate('new-claim');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#172554] text-white rounded-xl font-bold hover:bg-[#1e3a8a] cursor-pointer"
                >
                  <span>Re-examine in AI Investigation</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
