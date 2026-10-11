import os
import pickle
import threading
import numpy as np
from typing import List, Dict, Any, Tuple

class VectorStore:
    def __init__(self, storage_path: str = None):
        self._lock = threading.Lock()
        if storage_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            candidate_paths = [
                os.path.join(base_dir, "vector_store.pkl"),
                os.path.join(os.path.dirname(base_dir), "vector_store.pkl"),
                os.path.join(os.getcwd(), "vector_store.pkl"),
                os.path.join(os.getcwd(), "backend", "vector_store.pkl"),
            ]
            storage_path = candidate_paths[0]
            for p in candidate_paths:
                if os.path.exists(p):
                    storage_path = p
                    break
        self.storage_path = storage_path
        self.vectors: np.ndarray = np.empty((0, 384), dtype=np.float32)
        self.documents: List[str] = []
        self.metadata: List[Dict[str, Any]] = []
        self.load()

    def add_documents(self, documents: List[str], embeddings: np.ndarray, metadata: List[Dict[str, Any]]):
        if len(documents) == 0:
            return

        with self._lock:
            embeddings = np.array(embeddings, dtype=np.float32)
            if self.vectors.shape[0] == 0:
                self.vectors = embeddings
            else:
                self.vectors = np.vstack([self.vectors, embeddings])

            self.documents.extend(documents)
            self.metadata.extend(metadata)
            self.save()

    def clear(self):
        with self._lock:
            self.vectors = np.empty((0, 384), dtype=np.float32)
            self.documents = []
            self.metadata = []
            if os.path.exists(self.storage_path):
                try:
                    os.remove(self.storage_path)
                except Exception:
                    pass

    def similarity_search(self, query_vector: np.ndarray, top_k: int = 5) -> List[Tuple[str, Dict[str, Any], float]]:
        with self._lock:
            if len(self.documents) == 0 or self.vectors.shape[0] == 0:
                return []

            query_vector = np.array(query_vector, dtype=np.float32).flatten()
            norm = np.linalg.norm(query_vector)
            if norm > 0:
                query_vector = query_vector / norm

            # Compute cosine similarity (dot product of normalized vectors)
            scores = np.dot(self.vectors, query_vector)

            # Sort indices by score descending
            top_k = min(top_k, len(self.documents))
            top_indices = np.argsort(scores)[::-1][:top_k]

            results = []
            for idx in top_indices:
                score = float(scores[idx])
                results.append((self.documents[idx], self.metadata[idx], round(score, 4)))

            return results

    def save(self):
        try:
            os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
            with open(self.storage_path, "wb") as f:
                pickle.dump({
                    "vectors": self.vectors,
                    "documents": self.documents,
                    "metadata": self.metadata
                }, f)
        except Exception as e:
            print(f"[VectorStore] Error saving store to {self.storage_path}: {e}")

    def load(self):
        with self._lock:
            if os.path.exists(self.storage_path):
                try:
                    with open(self.storage_path, "rb") as f:
                        data = pickle.load(f)
                        self.vectors = data.get("vectors", np.empty((0, 384), dtype=np.float32))
                        self.documents = data.get("documents", [])
                        self.metadata = data.get("metadata", [])
                    print(f"[VectorStore] Loaded {len(self.documents)} documents from {self.storage_path}")
                except Exception as e:
                    print(f"[VectorStore] Warning loading store from {self.storage_path}: {e}")
            else:
                print(f"[VectorStore] Notice: storage file not found at {self.storage_path}")

vector_store = VectorStore()
