export interface ClaimRecord {
  id: string;
  claim_id: string;
  patient_id: string;
  policy_number: string;
  hospital_id: string;
  hospital_name: string;
  age: number;
  gender: 'Male' | 'Female';
  claim_amount: number;
  deductible_amount: number;
  copay_amount: number;
  claim_submitted_late: boolean;
  num_previous_claims_patient: number;
  num_previous_claims_provider: number;
  provider_patient_distance: number;
  diagnosis_code: string;
  diagnosis_desc: string;
  procedure_code: string;
  procedure_desc: string;
  num_procedures: number;
  admission_type: 'Elective' | 'Emergency' | 'Urgent';
  discharge_type: 'Home' | 'Transferred' | 'AMA';
  length_of_stay: number;
  service_type: 'Inpatient' | 'Outpatient';
  service_date: string;
  status: 'Fraudulent' | 'Legitimate' | 'Under Review';
  risk_level: 'High' | 'Medium' | 'Low';
  fraud_probability: number; // 0.00 to 1.00
  flagged_reasons?: string[];
}

export interface ProviderRecord {
  id: string;
  provider_id: string;
  name: string;
  facility_name: string;
  specialty: string;
  type: string;
  city: string;
  state: string;
  total_claims: number;
  flagged_claims: number;
  anomaly_rate: number; // percentage
  avg_claim_amount: number;
  risk_level: 'Elevated' | 'Moderate' | 'Normal';
  primary_diagnosis: string;
  status: 'Active Screening' | 'Verified Regular' | 'Audit Pending';
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  total_test_samples: number;
  confusion_matrix: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
  features: { name: string; importance: number }[];
}

export const MOCK_CLAIMS: ClaimRecord[] = [
  {
    id: '1',
    claim_id: 'CLM-2024-8841',
    patient_id: 'PAT-9012',
    policy_number: 'POL-664129',
    hospital_id: 'HOSP-104',
    hospital_name: 'Metro General Hospital',
    age: 58,
    gender: 'Male',
    claim_amount: 142500,
    deductible_amount: 1500,
    copay_amount: 250,
    claim_submitted_late: true,
    num_previous_claims_patient: 8,
    num_previous_claims_provider: 124,
    provider_patient_distance: 142.5,
    diagnosis_code: 'I10',
    diagnosis_desc: 'Essential (primary) hypertension',
    procedure_code: '99213',
    procedure_desc: 'Office or other outpatient visit, 20-29 mins',
    num_procedures: 4,
    admission_type: 'Emergency',
    discharge_type: 'Home',
    length_of_stay: 7,
    service_type: 'Inpatient',
    service_date: '2024-03-14',
    status: 'Fraudulent',
    risk_level: 'High',
    fraud_probability: 0.89,
    flagged_reasons: [
      'Disproportionately high claim amount for standard diagnosis (I10)',
      'Provider distance exceeds 140 miles from patient residence',
      'Late claim submission combined with multiple bundled procedures'
    ]
  },
  {
    id: '2',
    claim_id: 'CLM-2024-8842',
    patient_id: 'PAT-4318',
    policy_number: 'POL-118492',
    hospital_id: 'HOSP-208',
    hospital_name: 'St. Jude Regional Medical Center',
    age: 42,
    gender: 'Female',
    claim_amount: 12400,
    deductible_amount: 500,
    copay_amount: 50,
    claim_submitted_late: false,
    num_previous_claims_patient: 1,
    num_previous_claims_provider: 45,
    provider_patient_distance: 8.2,
    diagnosis_code: 'E11.9',
    diagnosis_desc: 'Type 2 diabetes mellitus without complications',
    procedure_code: '99214',
    procedure_desc: 'Office outpatient visit, detailed exam',
    num_procedures: 1,
    admission_type: 'Elective',
    discharge_type: 'Home',
    length_of_stay: 0,
    service_type: 'Outpatient',
    service_date: '2024-03-12',
    status: 'Legitimate',
    risk_level: 'Low',
    fraud_probability: 0.08
  },
  {
    id: '3',
    claim_id: 'CLM-2024-8843',
    patient_id: 'PAT-7721',
    policy_number: 'POL-883014',
    hospital_id: 'HOSP-305',
    hospital_name: 'Apex Orthopedic Surgery Center',
    age: 65,
    gender: 'Male',
    claim_amount: 98000,
    deductible_amount: 2000,
    copay_amount: 400,
    claim_submitted_late: true,
    num_previous_claims_patient: 5,
    num_previous_claims_provider: 210,
    provider_patient_distance: 95.0,
    diagnosis_code: 'M54.5',
    diagnosis_desc: 'Low back pain, unclassified',
    procedure_code: '22853',
    procedure_desc: 'Insertion of interbody biomechanical device',
    num_procedures: 5,
    admission_type: 'Urgent',
    discharge_type: 'Transferred',
    length_of_stay: 12,
    service_type: 'Inpatient',
    service_date: '2024-03-10',
    status: 'Under Review',
    risk_level: 'High',
    fraud_probability: 0.76,
    flagged_reasons: [
      'Multiple surgical spine implants coded under non-specific back pain',
      'Provider claim frequency significantly above peer hospital average',
      'Extreme length of stay outlier for procedural scope'
    ]
  },
  {
    id: '4',
    claim_id: 'CLM-2024-8844',
    patient_id: 'PAT-1934',
    policy_number: 'POL-441829',
    hospital_id: 'HOSP-112',
    hospital_name: 'Pine Valley Community Health',
    age: 29,
    gender: 'Female',
    claim_amount: 4350,
    deductible_amount: 300,
    copay_amount: 30,
    claim_submitted_late: false,
    num_previous_claims_patient: 0,
    num_previous_claims_provider: 18,
    provider_patient_distance: 4.5,
    diagnosis_code: 'J02.9',
    diagnosis_desc: 'Acute pharyngitis, unspecified',
    procedure_code: '99212',
    procedure_desc: 'Problem-focused outpatient visit',
    num_procedures: 1,
    admission_type: 'Elective',
    discharge_type: 'Home',
    length_of_stay: 0,
    service_type: 'Outpatient',
    service_date: '2024-03-09',
    status: 'Legitimate',
    risk_level: 'Low',
    fraud_probability: 0.04
  },
  {
    id: '5',
    claim_id: 'CLM-2024-8845',
    patient_id: 'PAT-6612',
    policy_number: 'POL-902143',
    hospital_id: 'HOSP-401',
    hospital_name: 'Horizon Diagnostic & Imaging',
    age: 51,
    gender: 'Male',
    claim_amount: 67200,
    deductible_amount: 1000,
    copay_amount: 200,
    claim_submitted_late: false,
    num_previous_claims_patient: 4,
    num_previous_claims_provider: 312,
    provider_patient_distance: 68.4,
    diagnosis_code: 'R07.9',
    diagnosis_desc: 'Chest pain, unspecified',
    procedure_code: '78452',
    procedure_desc: 'Myocardial perfusion imaging, tomographic (SPECT)',
    num_procedures: 3,
    admission_type: 'Emergency',
    discharge_type: 'Home',
    length_of_stay: 3,
    service_type: 'Inpatient',
    service_date: '2024-03-08',
    status: 'Fraudulent',
    risk_level: 'High',
    fraud_probability: 0.82,
    flagged_reasons: [
      'Unbundled cardiac imaging scans with repetitive billing codes',
      'Diagnostic discrepancy with patient prior claim history'
    ]
  },
  {
    id: '6',
    claim_id: 'CLM-2024-8846',
    patient_id: 'PAT-5529',
    policy_number: 'POL-332901',
    hospital_id: 'HOSP-104',
    hospital_name: 'Metro General Hospital',
    age: 71,
    gender: 'Female',
    claim_amount: 28400,
    deductible_amount: 800,
    copay_amount: 150,
    claim_submitted_late: false,
    num_previous_claims_patient: 3,
    num_previous_claims_provider: 124,
    provider_patient_distance: 12.1,
    diagnosis_code: 'K80.0',
    diagnosis_desc: 'Calculus of gallbladder with acute cholecystitis',
    procedure_code: '47562',
    procedure_desc: 'Laparoscopic cholecystectomy',
    num_procedures: 2,
    admission_type: 'Urgent',
    discharge_type: 'Home',
    length_of_stay: 4,
    service_type: 'Inpatient',
    service_date: '2024-03-05',
    status: 'Legitimate',
    risk_level: 'Low',
    fraud_probability: 0.14
  },
  {
    id: '7',
    claim_id: 'CLM-2024-8847',
    patient_id: 'PAT-8819',
    policy_number: 'POL-771920',
    hospital_id: 'HOSP-502',
    hospital_name: 'Silverline Ambulatory Surgery',
    age: 38,
    gender: 'Male',
    claim_amount: 45000,
    deductible_amount: 1200,
    copay_amount: 180,
    claim_submitted_late: true,
    num_previous_claims_patient: 2,
    num_previous_claims_provider: 165,
    provider_patient_distance: 82.0,
    diagnosis_code: 'M25.561',
    diagnosis_desc: 'Pain in right knee',
    procedure_code: '29881',
    procedure_desc: 'Arthroscopy, knee, surgical with meniscectomy',
    num_procedures: 3,
    admission_type: 'Elective',
    discharge_type: 'Home',
    length_of_stay: 1,
    service_type: 'Outpatient',
    service_date: '2024-03-03',
    status: 'Under Review',
    risk_level: 'Medium',
    fraud_probability: 0.61,
    flagged_reasons: [
      'Upcoded billing level compared to regional ambulatory benchmark',
      'Distance anomaly exceeding 75 miles for non-emergency outpatient procedure'
    ]
  },
  {
    id: '8',
    claim_id: 'CLM-2024-8848',
    patient_id: 'PAT-3391',
    policy_number: 'POL-554109',
    hospital_id: 'HOSP-208',
    hospital_name: 'St. Jude Regional Medical Center',
    age: 63,
    gender: 'Female',
    claim_amount: 112000,
    deductible_amount: 2500,
    copay_amount: 500,
    claim_submitted_late: false,
    num_previous_claims_patient: 6,
    num_previous_claims_provider: 45,
    provider_patient_distance: 14.8,
    diagnosis_code: 'I21.0',
    diagnosis_desc: 'ST elevation myocardial infarction (STEMI)',
    procedure_code: '92928',
    procedure_desc: 'Percutaneous transcatheter placement of coronary stent',
    num_procedures: 3,
    admission_type: 'Emergency',
    discharge_type: 'Home',
    length_of_stay: 6,
    service_type: 'Inpatient',
    service_date: '2024-03-01',
    status: 'Legitimate',
    risk_level: 'Low',
    fraud_probability: 0.18
  },
  {
    id: '9',
    claim_id: 'CLM-2024-8849',
    patient_id: 'PAT-9901',
    policy_number: 'POL-229981',
    hospital_id: 'HOSP-601',
    hospital_name: 'Evergreen Specialty Oncology',
    age: 55,
    gender: 'Male',
    claim_amount: 185000,
    deductible_amount: 3000,
    copay_amount: 750,
    claim_submitted_late: true,
    num_previous_claims_patient: 9,
    num_previous_claims_provider: 412,
    provider_patient_distance: 198.0,
    diagnosis_code: 'C34.90',
    diagnosis_desc: 'Malignant neoplasm of unspec part of bronchus or lung',
    procedure_code: '96413',
    procedure_desc: 'Chemotherapy administration, iv infusion up to 1 hr',
    num_procedures: 6,
    admission_type: 'Elective',
    discharge_type: 'Transferred',
    length_of_stay: 14,
    service_type: 'Inpatient',
    service_date: '2024-02-28',
    status: 'Fraudulent',
    risk_level: 'High',
    fraud_probability: 0.94,
    flagged_reasons: [
      'Ghost billing anomaly: Excessive concurrent infusion hours recorded',
      'Patient distance near 200 miles with zero documented prior local referral',
      'Provider claim count velocity exceeds 400 claims in quarterly cycle'
    ]
  },
  {
    id: '10',
    claim_id: 'CLM-2024-8850',
    patient_id: 'PAT-2041',
    policy_number: 'POL-331092',
    hospital_id: 'HOSP-112',
    hospital_name: 'Pine Valley Community Health',
    age: 34,
    gender: 'Male',
    claim_amount: 8600,
    deductible_amount: 400,
    copay_amount: 40,
    claim_submitted_late: false,
    num_previous_claims_patient: 1,
    num_previous_claims_provider: 18,
    provider_patient_distance: 6.0,
    diagnosis_code: 'S83.511A',
    diagnosis_desc: 'Sprain of anterior cruciate ligament of right knee',
    procedure_code: '73721',
    procedure_desc: 'Magnetic resonance imaging, any joint of lower extremity',
    num_procedures: 1,
    admission_type: 'Elective',
    discharge_type: 'Home',
    length_of_stay: 0,
    service_type: 'Outpatient',
    service_date: '2024-02-25',
    status: 'Legitimate',
    risk_level: 'Low',
    fraud_probability: 0.06
  }
];

export const MOCK_PROVIDERS: ProviderRecord[] = [
  {
    id: 'p1',
    provider_id: 'PRV-104',
    name: 'Dr. Gregory Vance, MD',
    facility_name: 'Metro General Hospital',
    specialty: 'Internal Medicine & Cardiology',
    type: 'Multi-Specialty Hospital',
    city: 'Chicago',
    state: 'IL',
    total_claims: 284,
    flagged_claims: 42,
    anomaly_rate: 14.8,
    avg_claim_amount: 38400,
    risk_level: 'Elevated',
    primary_diagnosis: 'I10 (Essential Hypertension)',
    status: 'Active Screening'
  },
  {
    id: 'p2',
    provider_id: 'PRV-208',
    name: 'Dr. Elena Rostova, MD',
    facility_name: 'St. Jude Regional Medical Center',
    specialty: 'Emergency Medicine',
    type: 'Regional Medical Center',
    city: 'Indianapolis',
    state: 'IN',
    total_claims: 412,
    flagged_claims: 19,
    anomaly_rate: 4.6,
    avg_claim_amount: 19200,
    risk_level: 'Normal',
    primary_diagnosis: 'I21.0 (Acute STEMI)',
    status: 'Verified Regular'
  },
  {
    id: 'p3',
    provider_id: 'PRV-305',
    name: 'Dr. Marcus Holloway, MD',
    facility_name: 'Apex Orthopedic Surgery Center',
    specialty: 'Orthopedic Surgery',
    type: 'Surgical Center',
    city: 'Milwaukee',
    state: 'WI',
    total_claims: 195,
    flagged_claims: 37,
    anomaly_rate: 19.0,
    avg_claim_amount: 64500,
    risk_level: 'Elevated',
    primary_diagnosis: 'M54.5 (Low Back Pain)',
    status: 'Audit Pending'
  },
  {
    id: 'p4',
    provider_id: 'PRV-112',
    name: 'Dr. Sarah Jenkins, DO',
    facility_name: 'Pine Valley Community Health',
    specialty: 'Family Medicine',
    type: 'Community Clinic',
    city: 'Peoria',
    state: 'IL',
    total_claims: 156,
    flagged_claims: 5,
    anomaly_rate: 3.2,
    avg_claim_amount: 6200,
    risk_level: 'Normal',
    primary_diagnosis: 'J02.9 (Acute Pharyngitis)',
    status: 'Verified Regular'
  },
  {
    id: 'p5',
    provider_id: 'PRV-401',
    name: 'Dr. Arthur Pendelton, MD',
    facility_name: 'Horizon Diagnostic & Imaging',
    specialty: 'Radiology & Imaging',
    type: 'Diagnostic Center',
    city: 'Rockford',
    state: 'IL',
    total_claims: 320,
    flagged_claims: 48,
    anomaly_rate: 15.0,
    avg_claim_amount: 32800,
    risk_level: 'Elevated',
    primary_diagnosis: 'R07.9 (Chest Pain Unspecified)',
    status: 'Active Screening'
  },
  {
    id: 'p6',
    provider_id: 'PRV-502',
    name: 'Dr. Nathan Drake, MD',
    facility_name: 'Silverline Ambulatory Surgery',
    specialty: 'Ambulatory Surgery',
    type: 'Outpatient Surgical Clinic',
    city: 'Evanston',
    state: 'IL',
    total_claims: 178,
    flagged_claims: 22,
    anomaly_rate: 12.4,
    avg_claim_amount: 28900,
    risk_level: 'Moderate',
    primary_diagnosis: 'M25.561 (Knee Pain)',
    status: 'Active Screening'
  },
  {
    id: 'p7',
    provider_id: 'PRV-601',
    name: 'Dr. Cynthia Chen, MD',
    facility_name: 'Evergreen Specialty Oncology',
    specialty: 'Medical Oncology',
    type: 'Cancer Center',
    city: 'Naperville',
    state: 'IL',
    total_claims: 245,
    flagged_claims: 39,
    anomaly_rate: 15.9,
    avg_claim_amount: 78500,
    risk_level: 'Elevated',
    primary_diagnosis: 'C34.90 (Malignant Neoplasm)',
    status: 'Audit Pending'
  }
];

export const MOCK_MODEL_METRICS: ModelMetrics = {
  accuracy: 0.942,
  precision: 0.918,
  recall: 0.895,
  f1_score: 0.906,
  auc_roc: 0.962,
  total_test_samples: 2000,
  confusion_matrix: {
    tp: 458,
    fp: 41,
    fn: 54,
    tn: 1447
  },
  features: [
    { name: 'Provider Previous Claims Velocity', importance: 0.28 },
    { name: 'Claim Amount Z-Score to Diagnosis', importance: 0.24 },
    { name: 'Late Submission Flag', importance: 0.16 },
    { name: 'Provider-Patient Distance Miles', importance: 0.14 },
    { name: 'Number of Procedures Coded', importance: 0.11 },
    { name: 'Length of Stay Anomaly', importance: 0.07 }
  ]
};

export const MOCK_MONTHLY_TRENDS = [
  { month: 'Oct 2023', total: 182, legitimate: 158, fraudulent: 24, rate: 13.2 },
  { month: 'Nov 2023', total: 204, legitimate: 174, fraudulent: 30, rate: 14.7 },
  { month: 'Dec 2023', total: 228, legitimate: 195, fraudulent: 33, rate: 14.5 },
  { month: 'Jan 2024', total: 215, legitimate: 183, fraudulent: 32, rate: 14.9 },
  { month: 'Feb 2024', total: 210, legitimate: 178, fraudulent: 32, rate: 15.2 },
  { month: 'Mar 2024', total: 245, legitimate: 206, fraudulent: 39, rate: 15.9 }
];

export const MOCK_RISK_DISTRIBUTION = [
  { name: 'Low Risk (<40%)', value: 852, color: '#22C55E' },
  { name: 'Medium Risk (40-70%)', value: 242, color: '#F59E0B' },
  { name: 'High Risk (>70%)', value: 190, color: '#EF4444' }
];

export const MOCK_PROBABILITY_BINS = [
  { range: '0.0 - 0.2', count: 680, label: '0-20%' },
  { range: '0.2 - 0.4', count: 172, label: '20-40%' },
  { range: '0.4 - 0.6', count: 118, label: '40-60%' },
  { range: '0.6 - 0.8', count: 124, label: '60-80%' },
  { range: '0.8 - 1.0', count: 190, label: '80-100%' }
];
