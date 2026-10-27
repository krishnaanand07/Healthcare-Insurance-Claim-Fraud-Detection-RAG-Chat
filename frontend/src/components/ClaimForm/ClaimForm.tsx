import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ClaimFormProps {
  onSubmit: (data: any) => void;
  isAnalyzing: boolean;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({ onSubmit, isAnalyzing }) => {
  const initialState = {
    claim_amount: '',
    service_date: '',
    diagnosis_code: '',
    procedure_code: '',
    number_of_procedures: '1',
    length_of_stay_days: '0',
    service_type: 'Inpatient',
    provider_specialty: '',
    admission_type: 'Elective',
    discharge_type: 'Home',
    provider_type: 'Hospital',
    provider_patient_distance_miles: '',
    previous_claims_patient: '0',
    previous_claims_provider: '0',
    claim_submitted_late: 'false'
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFillSample = () => {
    setFormData({
      claim_amount: '125000',
      service_date: '2024-03-15',
      diagnosis_code: 'I10',
      procedure_code: '99213',
      number_of_procedures: '1',
      length_of_stay_days: '3',
      service_type: 'Inpatient',
      provider_specialty: 'Cardiology',
      admission_type: 'Emergency',
      discharge_type: 'Home',
      provider_type: 'Hospital',
      provider_patient_distance_miles: '12',
      previous_claims_patient: '2',
      previous_claims_provider: '18',
      claim_submitted_late: 'false'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;
    const payload = {
      ...formData,
      claim_amount: parseFloat(formData.claim_amount) || 0,
      number_of_procedures: parseInt(formData.number_of_procedures) || 0,
      length_of_stay_days: parseInt(formData.length_of_stay_days) || 0,
      provider_patient_distance_miles: parseFloat(formData.provider_patient_distance_miles) || 0,
      previous_claims_patient: parseInt(formData.previous_claims_patient) || 0,
      previous_claims_provider: parseInt(formData.previous_claims_provider) || 0,
      claim_submitted_late: formData.claim_submitted_late === 'true'
    };
    onSubmit(payload);
  };

  return (
    <div className="neo-surface p-6 sm:p-8 h-full flex flex-col border border-[var(--color-border)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Claim Triage Details</h2>
          <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">Enter patient, provider, and clinical parameters for fraud evaluation</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={handleFillSample} 
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
          >
            Sample Anomaly
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
        <div className="flex-1 space-y-6">
          
          {/* Section 1: Financial & Dates */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--color-border)]">
              Financial & Admission Schedule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Claim Amount (₹)</label>
                <input type="number" name="claim_amount" value={formData.claim_amount} onChange={handleChange} className="neo-input" placeholder="e.g. 125000" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Service Date</label>
                <input type="date" name="service_date" value={formData.service_date} onChange={handleChange} className="neo-input" required />
              </div>
            </div>
          </div>

          {/* Section 2: Medical Information */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--color-border)]">
              Clinical & Billing Diagnostics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Diagnosis Code (ICD-10)</label>
                <input type="text" name="diagnosis_code" value={formData.diagnosis_code} onChange={handleChange} className="neo-input" placeholder="e.g. I10, E11.9" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Procedure Code (CPT)</label>
                <input type="text" name="procedure_code" value={formData.procedure_code} onChange={handleChange} className="neo-input" placeholder="e.g. 99213, 99214" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Number of Procedures</label>
                <input type="number" name="number_of_procedures" value={formData.number_of_procedures} onChange={handleChange} className="neo-input" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Length of Stay (Days)</label>
                <input type="number" name="length_of_stay_days" value={formData.length_of_stay_days} onChange={handleChange} className="neo-input" required />
              </div>
            </div>
          </div>

          {/* Section 3: Provider & Service */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--color-border)]">
              Provider & Operational Scope
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Service Type</label>
                <select name="service_type" value={formData.service_type} onChange={handleChange} className="neo-input">
                  <option value="Inpatient">Inpatient</option>
                  <option value="Outpatient">Outpatient</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Provider Specialty</label>
                <input type="text" name="provider_specialty" value={formData.provider_specialty} onChange={handleChange} className="neo-input" placeholder="e.g. Cardiology" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Provider Type</label>
                <select name="provider_type" value={formData.provider_type} onChange={handleChange} className="neo-input">
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Distance to Patient (Miles)</label>
                <input type="number" name="provider_patient_distance_miles" value={formData.provider_patient_distance_miles} onChange={handleChange} className="neo-input" required />
              </div>
            </div>
          </div>

          {/* Section 4: History & Adjudication */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3 pb-1 border-b border-[var(--color-border)]">
              Historical Frequency & Adjudication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Admission Type</label>
                <select name="admission_type" value={formData.admission_type} onChange={handleChange} className="neo-input">
                  <option value="Emergency">Emergency</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Elective">Elective</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Discharge Disposition</label>
                <select name="discharge_type" value={formData.discharge_type} onChange={handleChange} className="neo-input">
                  <option value="Home">Home</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Patient Prior Claims</label>
                <input type="number" name="previous_claims_patient" value={formData.previous_claims_patient} onChange={handleChange} className="neo-input" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Provider Prior Claims</label>
                <input type="number" name="previous_claims_provider" value={formData.previous_claims_provider} onChange={handleChange} className="neo-input" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Claim Submitted Late?</label>
                <select name="claim_submitted_late" value={formData.claim_submitted_late} onChange={handleChange} className="neo-input">
                  <option value="false">No (Timely Filing)</option>
                  <option value="true">Yes (Late Submission Flag)</option>
                </select>
              </div>
            </div>
          </div>
          
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
          <button type="button" onClick={() => setFormData(initialState)} className="neo-btn-secondary flex-1">
            <RefreshCw size={15} /> Reset Form
          </button>
          <button type="submit" disabled={isAnalyzing} className="neo-btn-primary flex-[2]">
            <Sparkles size={15} /> {isAnalyzing ? 'Running ML & AI Assessment...' : 'Run Fraud Audit ✦'}
          </button>
        </div>
      </form>
    </div>
  );
};

