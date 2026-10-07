# AI-Powered Healthcare Insurance Claim Fraud Detection and Investigation System

An upgraded, end-to-end AI-powered Healthcare Insurance Claim Fraud Detection and Investigation Platform built with **Python FastAPI**, **Scikit-Learn ML Models**, **Modular RAG (Retrieval-Augmented Generation)**, **NVIDIA Hosted LLM API**, and a **React + Vite + Tailwind CSS** Interactive Dashboard.

---

## 🏗️ Architecture Overview

The system enhances traditional machine learning fraud detection by combining quantitative risk scoring with knowledge-grounded AI decision support using RAG and NVIDIA LLMs:

```
User Enters Claim (React Dashboard)
                │
                ▼
        FastAPI Backend
                │
                ├───────────────► Existing ML Model (Scikit-Learn Random Forest)
                │                         │
                │                         ▼
                │                  Fraud Probability & Risk Score
                │                         │
                ▼                         ▼
   Claim Info & Anomalies ──────► RAG Retrieval System
                                          │
                                          ▼ (Sentence-Transformers + Vector Store)
                              Relevant Healthcare Fraud Knowledge / Rules / Billing Guidelines
                                          │
                                          ▼
                      Retrieved Context + Claim Details + ML Prediction
                                          │
                                          ▼
                                   NVIDIA LLM API
                                          │
                                          ▼
                         Structured AI Investigation Report
                           (Summary, Risk Factors, Evidence, Checklist)
                                          │
                                          ▼
                         React Dashboard & RAG Assistant Chat
```

---

## 🛠️ Technology Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning:** Scikit-Learn (Random Forest Classifier & Scaler), Joblib, Pandas, NumPy
- **RAG & Vector Storage:** Sentence-Transformers (`all-MiniLM-L6-v2`), Custom VectorStore (Cosine Similarity & Persistent Indexing), PyPDF, Scikit-Learn
- **LLM Engine:** NVIDIA Hosted API (`https://integrate.api.nvidia.com/v1`), OpenAI Python SDK
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Testing:** Pytest, HTTPX

---

## 📁 Repository Structure

```
Healthcare-Insurance-Claim-Fraud-Detection/
├── backend/
│   ├── main.py                       # FastAPI Application Entry Point
│   ├── .env.example                  # Environment Variables Template
│   ├── requirements.txt              # Python Dependencies
│   ├── knowledge_base/               # Knowledge Base Markdown/PDF Documents
│   │   ├── sample_fraud_indicators.md
│   │   ├── claim_investigation_guidelines.md
│   │   ├── medical_billing_and_cpt_icd_codes.md
│   │   └── provider_anomalies_and_patterns.md
│   ├── rag/                          # RAG Pipeline Components
│   │   ├── __init__.py
│   │   ├── embeddings.py             # SentenceTransformers Embedding Engine
│   │   ├── vectorstore.py            # Vector Storage & Cosine Similarity Index
│   │   ├── ingest.py                 # Document Chunking & Embedding Ingestion
│   │   ├── retriever.py              # Knowledge Retrieval Engine
│   │   └── prompts.py                # Structured RAG & Chat Prompts
│   ├── schemas/                      # Pydantic Schemas
│   │   └── ai_schemas.py             # AI Investigation & Chat Payloads
│   ├── services/                     # Core Business Logic Services
│   │   ├── ml_service.py             # ML Fraud Prediction Engine
│   │   ├── llm_service.py            # NVIDIA LLM Client & Structured Response Generator
│   │   ├── investigation_service.py  # Orchestrator (ML + RAG + LLM)
│   │   └── chat_service.py           # RAG Chatbot with Memory
│   ├── routes/                       # FastAPI API Routers
│   │   ├── ai_investigation.py       # POST /api/ai/investigate
│   │   ├── ai_chat.py                # POST /api/ai/chat
│   │   ├── prediction.py             # POST /api/predict/manual
│   │   ├── claims.py
│   │   └── analysis.py
│   └── tests/                        # Automated Pytest Suite
│       ├── test_ml.py
│       ├── test_rag.py
│       ├── test_llm.py
│       ├── test_endpoints.py
│       └── test_resilience.py
├── frontend/                         # React + Vite Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIInvestigation/      # AI Investigation Dashboard & Chat Components
│   │   │   │   ├── AIInvestigation.tsx
│   │   │   │   ├── AIChat.tsx
│   │   │   │   ├── EvidenceSources.tsx
│   │   │   │   └── RiskFactors.tsx
│   │   │   ├── Analysis/
│   │   │   ├── ClaimForm/
│   │   │   └── Layout/
│   │   └── App.tsx
│   └── package.json
├── 6.Artifacts/                      # Pre-trained ML Model (.pkl) & Scaler
│   ├── random_forest.pkl
│   └── scaler.pkl
├── main.py                           # Root Application Entry Point
├── README.md
└── requirements.txt
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env configuration
cp .env.example .env
```

Edit `backend/.env` and add your NVIDIA API Key:
```env
NVIDIA_API_KEY=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
NVIDIA_MODEL=meta/llama-3.2-11b-vision-instruct
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

### 2. Run Document Ingestion (RAG Pipeline)

Build the vector storage index from the knowledge base:
```bash
python -m rag.ingest
```

### 3. Start Backend Server

```bash
python main.py
```
The API server will run at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

---

### 4. Frontend Setup

In a new terminal window:
```bash
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

Run the comprehensive pytest suite covering ML prediction, RAG ingestion, document retrieval, NVIDIA LLM integration, endpoints, and resilience/fallbacks:

```bash
pytest backend/tests/
```

Expected output:
```
======================= 13 passed in 27.74s =======================
```

---

## 📡 API Endpoints

### 1. AI Claim Investigation Report
- **Endpoint:** `POST /api/ai/investigate`
- **Request Body:**
```json
{
  "claim": {
    "claim_amount": 125000,
    "service_date": "2024-03-15",
    "diagnosis_code": "I10",
    "procedure_code": "99213",
    "service_type": "Inpatient",
    "length_of_stay_days": 3,
    "provider_specialty": "Cardiology"
  }
}
```
- **Response:**
```json
{
  "ml_prediction": {
    "is_fraudulent": true,
    "fraud_probability": 0.85,
    "verdict": "SUSPICIOUS",
    "risk_score": 85,
    "risk_level": "HIGH"
  },
  "retrieved_context": [
    {
      "filename": "sample_fraud_indicators.md",
      "section": "Upcoding & Unbundling",
      "score": 0.89
    }
  ],
  "ai_analysis": {
    "summary": "Executive AI summary...",
    "risk_level": "HIGH",
    "fraud_probability": 0.85,
    "key_risk_factors": ["High claim amount", "Outpatient LOS discrepancy"],
    "supporting_evidence": [...],
    "recommended_investigation_steps": ["Step 1", "Step 2"],
    "limitations": ["Requires physical chart audit"]
  }
}
```

### 2. RAG Assistant Chatbot
- **Endpoint:** `POST /api/ai/chat`
- **Request Body:**
```json
{
  "query": "Why was this claim flagged as high risk?",
  "claim": { "claim_amount": 125000 },
  "investigation_id": "optional-uuid"
}
```

---

## 🛡️ Security & Privacy

- `NVIDIA_API_KEY` is loaded strictly on the backend and never exposed to the frontend/Vite bundle.
- `.env` files are included in `.gitignore` to prevent secret commits.
- Full fallback resilience ensures the ML fraud model remains operational even if remote LLM services or internet connectivity fail.
