import os
import pickle
import joblib
import pandas as pd
from typing import Dict, Any

class FraudPredictionService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self._loaded = False

    def _load_artifacts(self):
        if self._loaded:
            return
        self._loaded = True
        # Look for 6.Artifacts in root directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        artifacts_dir = os.path.join(base_dir, "6.Artifacts")
        model_path = os.path.join(artifacts_dir, "random_forest.pkl")
        scaler_path = os.path.join(artifacts_dir, "scaler.pkl")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                self.model = joblib.load(model_path)
                with open(scaler_path, "rb") as f:
                    self.scaler = pickle.load(f)
                print("[FraudPredictionService] ML Model & Scaler loaded successfully from 6.Artifacts!")
            except Exception as e:
                print(f"[FraudPredictionService] Warning loading artifacts: {e}")

    def predict(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs ML Model if full dataset features are provided, otherwise falls back to rule-based evaluation.
        """
        if not self._loaded:
            self._load_artifacts()

        # If we have trained artifacts and required numeric columns, use trained ML model
        if self.model is not None and self.scaler is not None and "Claim_Amount" in claim_data:
            try:
                data_dict = dict(claim_data)
                rename_mapping = {
                    "Provider_Type_Specialist_Office": "Provider_Type_Specialist Office",
                    "Provider_Type_Urgent_Care": "Provider_Type_Urgent Care",
                    "Provider_Specialty_General_Practice": "Provider_Specialty_General Practice",
                    "Provider_Specialty_Physical_Therapy": "Provider_Specialty_Physical Therapy",
                    "Discharge_Type_Rehab_Skilled_Nursing": "Discharge_Type_Rehab/Skilled Nursing",
                    "Discharge_Type_Transfer_to_another_facility": "Discharge_Type_Transfer to another facility"
                }
                df = pd.DataFrame([data_dict])
                df.rename(columns=rename_mapping, inplace=True)
                
                scale_columns = [
                    'Claim_Amount', 'Patient_Age', 'Patient_City', 'Provider_City',
                    'Diagnosis_Code', 'Procedure_Code', 'Number_of_Procedures',
                    'Length_of_Stay_Days', 'Deductible_Amount', 'CoPay_Amount',
                    'Number_of_Previous_Claims_Patient', 'Number_of_Previous_Claims_Provider',
                    'Provider_Patient_Distance_Miles', 'Claim_Year', 'Claim_Month', 'Claim_Delay_Days'
                ]
                # Filter scale columns present
                scale_cols_present = [c for c in scale_columns if c in df.columns]
                if len(scale_cols_present) == len(scale_columns):
                    df[scale_columns] = self.scaler.transform(df[scale_columns])
                    prediction = bool(self.model.predict(df)[0])
                    probability = float(self.model.predict_proba(df)[0][1])
                    risk_score = int(probability * 100)
                    
                    if probability <= 0.30:
                        verdict, risk_level = "LIKELY_GENUINE", "LOW"
                    elif probability <= 0.60:
                        verdict, risk_level = "REQUIRES_HUMAN_REVIEW", "MEDIUM"
                    else:
                        verdict, risk_level = "SUSPICIOUS", "HIGH"

                    return {
                        "is_fraudulent": prediction,
                        "fraud_probability": round(probability, 4),
                        "verdict": verdict,
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "confidence": int((max(probability, 1 - probability)) * 100),
                        "insights": [f"ML Model prediction score: {risk_score}/100", f"Trained RF Model probability: {round(probability*100, 1)}%"]
                    }
            except Exception as e:
                print(f"[FraudPredictionService] Error in model inference: {e}. Using rule evaluation.")

        return self.predict_manual(claim_data)

    def predict_manual(self, data: Dict[str, Any]) -> Dict[str, Any]:
        insights = []
        anomalies_count = 0
        
        claim_amount = float(data.get("claim_amount") or data.get("Claim_Amount") or 0)
        if claim_amount > 100000:
            insights.append("Claim amount is significantly higher than expected range ($100,000+)")
            anomalies_count += 2
        elif claim_amount > 50000:
            insights.append("Claim amount is slightly elevated ($50,000+)")
            anomalies_count += 1
        else:
            insights.append("Claim amount is within expected range")
            
        diag = str(data.get("diagnosis_code") or data.get("Diagnosis_Code") or "")
        proc = str(data.get("procedure_code") or data.get("Procedure_Code") or "")
        if (diag == "0" and proc != "0") or (proc == "0" and diag != "0"):
            insights.append("Diagnosis and procedure code combination requires verification")
            anomalies_count += 1
        else:
            insights.append("Diagnosis and procedure are consistent")
            
        los = int(data.get("length_of_stay_days") or data.get("Length_of_Stay_Days") or 0)
        svc_type = str(data.get("service_type") or data.get("Service_Type") or "").lower()
        if "outpatient" in svc_type and los > 0:
            insights.append("Outpatient service with non-zero length of stay is highly unusual")
            anomalies_count += 2
        elif los > 14:
            insights.append("Length of stay is unusually long (>14 days)")
            anomalies_count += 1
        else:
            insights.append("Length of stay is reasonable for treatment type")
            
        pat_claims = int(data.get("previous_claims_patient") or data.get("Number_of_Previous_Claims_Patient") or 0)
        prov_claims = int(data.get("previous_claims_provider") or data.get("Number_of_Previous_Claims_Provider") or 0)
        
        if pat_claims > 15:
            insights.append("Patient has an unusually high claim history (>15 claims)")
            anomalies_count += 1
        if prov_claims > 100:
            insights.append("Provider has an unusually high number of previous claims (>100 claims)")
            anomalies_count += 1
        if pat_claims <= 15 and prov_claims <= 100:
            insights.append("No unusual claim history detected for patient or provider")
            
        late = bool(data.get("claim_submitted_late") or data.get("Claim_Submitted_Late") or False)
        if late:
            insights.append("Claim was submitted unusually late")
            anomalies_count += 1
        else:
            insights.append("Submitted within expected timeframe")

        base_risk = 10
        risk_score = min(100, base_risk + (anomalies_count * 20))
        fraud_prob = round(risk_score / 100.0, 2)
        
        if risk_score <= 30:
            verdict = "LIKELY_GENUINE"
            risk_level = "LOW"
            confidence = 92
        elif risk_score <= 60:
            verdict = "REQUIRES_HUMAN_REVIEW"
            risk_level = "MEDIUM"
            confidence = 82
        else:
            verdict = "SUSPICIOUS"
            risk_level = "HIGH"
            confidence = 95
            
        return {
            "is_fraudulent": risk_score > 60,
            "fraud_probability": fraud_prob,
            "verdict": verdict,
            "risk_score": risk_score,
            "confidence": confidence,
            "risk_level": risk_level,
            "insights": insights
        }

ml_service = FraudPredictionService()
