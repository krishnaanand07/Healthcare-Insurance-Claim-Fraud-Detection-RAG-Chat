import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  Calendar, 
  FileSpreadsheet
} from 'lucide-react';
import { MOCK_CLAIMS } from '../../data/mockData';

export const ReportsPage: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const exportClaimsCSV = () => {
    const headers = [
      'Claim ID',
      'Patient ID',
      'Policy Number',
      'Hospital Name',
      'Service Date',
      'Claim Amount',
      'Diagnosis Code',
      'Procedure Code',
      'Length of Stay (Days)',
      'Fraud Probability',
      'Status',
      'Risk Level'
    ];

    const rows = MOCK_CLAIMS.map(c => [
      c.claim_id,
      c.patient_id,
      c.policy_number,
      `"${c.hospital_name}"`,
      c.service_date,
      c.claim_amount,
      c.diagnosis_code,
      c.procedure_code,
      c.length_of_stay,
      c.fraud_probability,
      c.status,
      c.risk_level
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Healthcare_Fraud_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Claims Audit Register CSV downloaded successfully.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const exportHighRiskCSV = () => {
    const highRisk = MOCK_CLAIMS.filter(c => c.risk_level === 'High');
    const headers = [
      'Claim ID',
      'Patient ID',
      'Hospital Name',
      'Amount',
      'Fraud Probability',
      'Diagnosis',
      'Primary Flagged Findings'
    ];

    const rows = highRisk.map(c => [
      c.claim_id,
      c.patient_id,
      `"${c.hospital_name}"`,
      c.claim_amount,
      c.fraud_probability,
      c.diagnosis_code,
      `"${(c.flagged_reasons || []).join('; ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `High_Risk_SIU_Dossier_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('High-Risk SIU Dossier CSV downloaded successfully.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Fraud Audit & Compliance Reports</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Generate, preview, and export standardized audit summaries and claim-level forensic records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-2 rounded-lg">
            <Calendar size={14} />
            <span>Generated: {reportDate}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Success Download Alert */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neo-surface p-4 border border-[var(--color-border)]">
          <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">Audited Claims</p>
          <p className="text-2xl font-extrabold text-[var(--color-text-primary)] mt-1">1,284</p>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">100% processed</p>
        </div>

        <div className="neo-surface p-4 border border-[var(--color-border)]">
          <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">Prevented Loss</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">₹1,42,89,000</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Intercepted payout</p>
        </div>

        <div className="neo-surface p-4 border border-[var(--color-border)]">
          <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">SIU Referrals</p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">38</p>
          <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold mt-0.5">Special investigations</p>
        </div>

        <div className="neo-surface p-4 border border-[var(--color-border)]">
          <p className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase">Audit Completeness</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">99.4%</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Automated RAG triage</p>
        </div>
      </div>


      {/* Export Report Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Report 1: Full Claims Audit */}
        <div className="neo-surface p-5 border border-[var(--color-border)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                <FileSpreadsheet size={20} />
              </span>
              <span className="text-[10px] font-bold bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-2 py-0.5 rounded">
                CSV FORMAT
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Full Claims Audit Register</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
              Complete tabular export containing all claims records, patient demographics, provider identifiers, clinical ICD/CPT codes, and Random Forest fraud scores.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">1,284 records</span>
            <button
              onClick={exportClaimsCSV}
              className="flex items-center gap-1.5 bg-[#172554] dark:bg-blue-600 hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Report 2: High-Risk SIU Dossier */}
        <div className="neo-surface p-5 border border-[var(--color-border)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                <ShieldAlert size={20} />
              </span>
              <span className="text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                PRIORITY TRIAGE
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">High-Risk SIU Referral Dossier</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
              Curated audit file containing only claims exceeding 70% fraud probability with detailed clinical and billing anomaly rationales for special investigative review.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-secondary)] font-mono">38 high-risk claims</span>
            <button
              onClick={exportHighRiskCSV}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>Export Priority SIU</span>
            </button>
          </div>
        </div>
      </div>


      {/* Claim-Level Investigation Preview Table */}
      <div className="neo-surface p-6 border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">Recent Audit Ledger Sample</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Snapshot of live audited claim entries included in the export datasets</p>
          </div>
          <span className="text-xs text-[var(--color-text-secondary)] font-mono">Sample: Top 5 entries</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] uppercase font-bold text-[10px] tracking-wider border-b border-[var(--color-border)]">
              <tr>
                <th className="p-3">Claim ID</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Diagnosis</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Score</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)] font-medium">
              {MOCK_CLAIMS.slice(0, 5).map(c => (
                <tr key={c.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                  <td className="p-3 font-mono font-bold text-[var(--color-text-primary)]">{c.claim_id}</td>
                  <td className="p-3 text-[var(--color-text-primary)]">{c.hospital_name}</td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{c.diagnosis_code} - {c.diagnosis_desc}</td>
                  <td className="p-3 text-right font-bold text-[var(--color-text-primary)] font-mono">₹{c.claim_amount.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-xs font-mono border ${
                      c.fraud_probability > 0.7 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {(c.fraud_probability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
