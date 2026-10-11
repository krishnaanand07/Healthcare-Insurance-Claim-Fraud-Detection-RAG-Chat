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
    <div className="neo-surface p-8 h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#172554] mb-1">Claim Details</h2>
          <p className="text-[#64748B] text-sm">Enter the claim information to analyze</p>
        </div>
        <button type="button" onClick={handleFillSample} className="neo-btn-secondary py-2 px-4 text-sm font-bold bg-[#FACC15]/20 text-[#172554] border border-[#FACC15]/50 hover:bg-[#FACC15]/30 transition-all">
          Fill Sample
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
        <div className="flex-1 mb-6">
          
          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider mb-4 pb-2 border-b border-[#172554]/10">Financial & Dates</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Claim Amount (₹)</label>
                <input type="number" name="claim_amount" value={formData.claim_amount} onChange={handleChange} className="neo-input" placeholder="e.g. 125000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Service Date</label>
                <input type="date" name="service_date" value={formData.service_date} onChange={handleChange} className="neo-input" required />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider mb-4 pb-2 border-b border-[#172554]/10">Medical Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Diagnosis Code</label>
                <input type="text" name="diagnosis_code" value={formData.diagnosis_code} onChange={handleChange} className="neo-input" placeholder="e.g. I10" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Procedure Code</label>
                <input type="text" name="procedure_code" value={formData.procedure_code} onChange={handleChange} className="neo-input" placeholder="e.g. 99213" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Number of Procedures</label>
                <input type="number" name="number_of_procedures" value={formData.number_of_procedures} onChange={handleChange} className="neo-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Length of Stay (Days)</label>
                <input type="number" name="length_of_stay_days" value={formData.length_of_stay_days} onChange={handleChange} className="neo-input" required />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider mb-4 pb-2 border-b border-[#172554]/10">Provider & Service</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Service Type</label>
                <select name="service_type" value={formData.service_type} onChange={handleChange} className="neo-input">
                  <option value="Inpatient">Inpatient</option>
                  <option value="Outpatient">Outpatient</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Provider Specialty</label>
                <input type="text" name="provider_specialty" value={formData.provider_specialty} onChange={handleChange} className="neo-input" placeholder="e.g. Cardiology" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Provider Type</label>
                <select name="provider_type" value={formData.provider_type} onChange={handleChange} className="neo-input">
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Distance (Miles)</label>
                <input type="number" name="provider_patient_distance_miles" value={formData.provider_patient_distance_miles} onChange={handleChange} className="neo-input" required />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#172554] uppercase tracking-wider mb-4 pb-2 border-b border-[#172554]/10">Admission & History</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Admission Type</label>
                <select name="admission_type" value={formData.admission_type} onChange={handleChange} className="neo-input">
                  <option value="Emergency">Emergency</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Elective">Elective</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Discharge Type</label>
                <select name="discharge_type" value={formData.discharge_type} onChange={handleChange} className="neo-input">
                  <option value="Home">Home</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Patient Previous Claims</label>
                <input type="number" name="previous_claims_patient" value={formData.previous_claims_patient} onChange={handleChange} className="neo-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#64748B] mb-2">Provider Previous Claims</label>
                <input type="number" name="previous_claims_provider" value={formData.previous_claims_provider} onChange={handleChange} className="neo-input" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[#64748B] mb-2">Claim Submitted Late?</label>
                <select name="claim_submitted_late" value={formData.claim_submitted_late} onChange={handleChange} className="neo-input">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
          </div>
          
        </div>

        <div className="flex gap-4 pt-4 border-t border-[#172554]/10">
          <button type="button" onClick={() => setFormData(initialState)} className="neo-btn-secondary flex-1">
            <RefreshCw size={18} /> Reset
          </button>
          <button type="submit" disabled={isAnalyzing} className="neo-btn-primary flex-[2]">
            <Sparkles size={18} /> {isAnalyzing ? 'Analyzing...' : 'Analyze Claim ✦'}
          </button>
        </div>
      </form>
    </div>
  );
};
