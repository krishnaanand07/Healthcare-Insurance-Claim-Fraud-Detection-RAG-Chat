import os
import sys
import glob
from typing import List, Dict, Any

# Add backend directory to sys.path to allow running as script or module
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.embeddings import embedding_service
from rag.vectorstore import vector_store

def load_file_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.md', '.txt']:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    elif ext == '.pdf':
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text
        except Exception as e:
            print(f"[Ingest] Error reading PDF {file_path}: {e}")
            return ""
    return ""

def split_text_into_chunks(text: str, filename: str, chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, Any]]:
    chunks = []
    lines = text.split('\n')
    current_section = "General"
    current_chunk = []
    current_len = 0
    chunk_counter = 0

    for line in lines:
        stripped = line.strip()
        if stripped.startswith('#'):
            current_section = stripped.lstrip('#').strip()

        current_chunk.append(line)
        current_len += len(line)

        if current_len >= chunk_size:
            chunk_text = "\n".join(current_chunk).strip()
            if chunk_text:
                chunk_counter += 1
                chunks.append({
                    "chunk_id": f"{filename}_chunk_{chunk_counter}",
                    "text": chunk_text,
                    "section": current_section,
                    "filename": filename,
                    "document_type": os.path.splitext(filename)[1].lstrip('.').upper(),
                    "source": filename
                })
            # Overlap: keep the last few lines
            overlap_lines = []
            overlap_len = 0
            for prev_line in reversed(current_chunk):
                overlap_lines.insert(0, prev_line)
                overlap_len += len(prev_line)
                if overlap_len >= overlap:
                    break
            current_chunk = overlap_lines
            current_len = overlap_len

    if current_chunk:
        chunk_text = "\n".join(current_chunk).strip()
        if chunk_text:
            chunk_counter += 1
            chunks.append({
                "chunk_id": f"{filename}_chunk_{chunk_counter}",
                "text": chunk_text,
                "section": current_section,
                "filename": filename,
                "document_type": os.path.splitext(filename)[1].lstrip('.').upper(),
                "source": filename
            })

    return chunks

def ingest_knowledge_base(kb_dir: str = None) -> int:
    if kb_dir is None:
        kb_dir = os.path.join(BASE_DIR, "knowledge_base")

    if not os.path.exists(kb_dir):
        print(f"[Ingest] Knowledge base directory not found at {kb_dir}")
        return 0

    print(f"[Ingest] Scanning knowledge base: {kb_dir}")
    supported_extensions = ['*.md', '*.txt', '*.pdf']
    file_paths = []
    for ext in supported_extensions:
        file_paths.extend(glob.glob(os.path.join(kb_dir, ext)))

    if not file_paths:
        print("[Ingest] No supported documents found in knowledge base.")
        return 0

    all_chunks = []
    for fp in file_paths:
        filename = os.path.basename(fp)
        text = load_file_text(fp)
        if not text.strip():
            continue
        file_chunks = split_text_into_chunks(text, filename)
        all_chunks.extend(file_chunks)
        print(f"[Ingest] Loaded '{filename}': extracted {len(file_chunks)} chunks.")

    if not all_chunks:
        print("[Ingest] No text chunks extracted.")
        return 0

    # Clear previous index for repeatable ingestion
    vector_store.clear()

    texts = [c["text"] for c in all_chunks]
    metadata = [{
        "chunk_id": c["chunk_id"],
        "filename": c["filename"],
        "document_type": c["document_type"],
        "section": c["section"],
        "source": c["source"]
    } for c in all_chunks]

    print(f"[Ingest] Generating embeddings for {len(texts)} chunks...")
    embeddings = embedding_service.embed_texts(texts)

    vector_store.add_documents(texts, embeddings, metadata)
    print(f"[Ingest] Successfully ingested {len(texts)} chunks into vector store.")
    return len(texts)

if __name__ == "__main__":
    ingest_knowledge_base()
