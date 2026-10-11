import os
import threading
import time
import numpy as np
from typing import List

# Limit thread overhead on CPU servers
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Check if heavy neural embeddings are explicitly enabled (disabled by default on Render 512M)
ENABLE_HEAVY_EMBEDDINGS = os.environ.get("ENABLE_HEAVY_EMBEDDINGS", "false").lower() in ("true", "1")

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self._initialized = False
        self._init_lock = threading.Lock()
        self.init_duration_ms = 0

    def init_model(self):
        """
        Memory-safe initialization.
        On Render free tier (512 MiB limit), heavy PyTorch / SentenceTransformer
        initialization is bypassed by default to prevent OOM termination.
        """
        if self._initialized:
            return

        with self._init_lock:
            if self._initialized:
                return

            if not ENABLE_HEAVY_EMBEDDINGS:
                print("[EmbeddingService] Running in lightweight memory-safe mode (<512M limit). PyTorch / SentenceTransformer downloads bypassed.")
                self.model = None
                self._initialized = True
                return

            t0 = time.time()
            try:
                import torch
                torch.set_num_threads(1)
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
                self.init_duration_ms = int((time.time() - t0) * 1000)
                print(f"[EmbeddingService] SentenceTransformer model '{self.model_name}' loaded successfully in {self.init_duration_ms}ms.")
            except Exception as e:
                print(f"[EmbeddingService] Notice: Could not load SentenceTransformer ({e}). Using lightweight vectorizer.")
                self.model = None
            finally:
                self._initialized = True

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 384), dtype=np.float32)

        if not self._initialized:
            self.init_model()

        if self.model is not None:
            try:
                embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
                norms[norms == 0] = 1.0
                return (embeddings / norms).astype(np.float32)
            except Exception as e:
                print(f"[EmbeddingService] Error during neural encoding: {e}. Falling back to lightweight vectorizer.")

        return self._fallback_embed(texts)

    def embed_query(self, query: str) -> np.ndarray:
        return self.embed_texts([query])[0]

    def _fallback_embed(self, texts: List[str]) -> np.ndarray:
        from sklearn.feature_extraction.text import HashingVectorizer
        vectorizer = HashingVectorizer(n_features=384, norm='l2', alternate_sign=False)
        matrix = vectorizer.transform(texts).toarray()
        return matrix.astype(np.float32)

embedding_service = EmbeddingService()
