import sys
import os
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure backend root directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load environment variables
env_path = os.path.join(BASE_DIR, ".env")
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(BASE_DIR), ".env")
load_dotenv(env_path)

from app.database import models
from app.database.db import engine
from app.routes import claims, prediction, analysis, rag, ai_investigation, ai_chat
from services.llm_service import llm_service
from services.ml_service import ml_service
from rag.vectorstore import vector_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("main_app")

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Warning] Database metadata creation error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Ultra-fast, memory-safe startup (<100ms total, ~130 MiB RAM).
    Binds to 0.0.0.0:$PORT immediately so Render port detection passes without delay.
    Avoids loading heavy PyTorch/SentenceTransformer models during startup.
    """
    logger.info("[Startup] Pre-warming Fraud ML Prediction Model and Scaler...")
    ml_service.load_artifacts()

    logger.info("[Startup] Loading lightweight knowledge base vector store into memory...")
    vector_store.load()

    logger.info("[Startup] Startup complete (<150MB RAM). Uvicorn binding to port immediately.")
    yield
    logger.info("[Shutdown] Application stopping.")

app = FastAPI(
    title="Healthcare Insurance Decision Support System API",
    description="AI-powered Healthcare Insurance Claim Fraud Detection and Investigation System using RAG + Multi-LLM Router.",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS: exact origins, no wildcards when allow_credentials=True
allowed_origins = [
    "https://healthcare-insurance-claim-fraud-de-six.vercel.app",
    "https://rag-healthcare-insurance-claim-fraud.vercel.app",
    "https://healthcare-insurance-claim-fraud-uu8l.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    max_age=86400,
)

# Include Routers
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(prediction.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(analysis.router, prefix="/api/analyze", tags=["Analysis"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG"])
app.include_router(ai_investigation.router, prefix="/api/ai", tags=["AI Investigation"])
app.include_router(ai_chat.router, prefix="/api/ai", tags=["AI Chat"])

@app.api_route("/", methods=["GET", "HEAD"], tags=["Root"])
def read_root():
    return {
        "status": "ok",
        "service": "Healthcare Insurance Claim Fraud Detection API",
        "docs": "/docs",
        "health": "/health"
    }

@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
def health_simple():
    return {
        "status": "ok",
        "service": "healthcare-claim-fraud-api"
    }

@app.api_route("/api/health", methods=["GET", "HEAD"], tags=["Health"])
def health_check():
    return {
        "backend": "ok",
        "status": "ok",
        "health": "healthy",
        "providers": llm_service.get_provider_status()
    }

@app.api_route("/api/health/providers", methods=["GET", "HEAD"], tags=["Health"])
def provider_diagnostics():
    """
    Endpoint returning independent diagnostics, latency, and status for each LLM provider.
    """
    return {
        "status": "ok",
        "diagnostics": llm_service.get_provider_diagnostics()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
