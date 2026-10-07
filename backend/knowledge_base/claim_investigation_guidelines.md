# Healthcare Claim Investigation Guidelines & Standard Procedures

## 1. Initial Claim Triage
- **Probability Assessment:** Evaluate the Machine Learning model's fraud probability score. Claims with a probability above 0.70 or marked 'HIGH' risk require full investigative review.
- **Data Completeness Check:** Verify that diagnosis code (ICD-10), procedure code (CPT), provider ID, patient ID, and financial fields are fully populated and formatted properly.

## 2. Evidence Gathering Workflow
- **Medical Record Audit:** Request certified medical charts, physician notes, and itemized billing statements from the healthcare provider.
- **Patient Confirmation:** Contact the insured patient to verify whether the procedure took place, dates of attendance, and provider interactions.
- **Provider Licensing & History:** Cross-examine provider national registry (NPI), state licensing status, and past sanction databases.

## 3. Anomaly Analysis Standard
- **Diagnosis vs Procedure Matching:** Confirm that the CPT procedure code directly matches the clinical indication specified by the ICD diagnosis code.
- **Financial Thresholds:** Claims exceeding $50,000 for standard outpatient services or showing unexpected copay/deductible ratios require financial audit.
- **Geographic Feasibility:** Cross-reference provider location with patient home state and city to check travel distance reasonableness.

## 4. Escalation & Reporting Protocols
- If suspicious indicators (e.g., unbundling or duplicate billing) are corroborated by evidence, escalate the claim to the Special Investigations Unit (SIU).
- Document all findings in the claim investigation ledger with timestamps, source citations, and investigator recommendations.
