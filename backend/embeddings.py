from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding_model():
    return model

def encode_text(text: str) -> list:
    """Encode text to 384-dimensional embedding vector."""
    embedding = model.encode(text, convert_to_numpy=False)
    return embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)

def compute_worker_embedding(worker_data: dict) -> list:
    """Compute embedding for a worker based on their profile."""
    parts = [
        worker_data.get('name', ''),
        worker_data.get('role', ''),
        worker_data.get('skills', ''),
        worker_data.get('location', ''),
        worker_data.get('bio', ''),
    ]
    
    text = ' '.join(p for p in parts if p)
    
    if not text.strip():
        return [0.0] * 384
    
    return encode_text(text)

def cosine_similarity(a: list, b: list) -> float:
    """Compute cosine similarity between two vectors."""
    a_np = np.array(a, dtype=np.float32)
    b_np = np.array(b, dtype=np.float32)
    
    dot_product = np.dot(a_np, b_np)
    norm_a = np.linalg.norm(a_np)
    norm_b = np.linalg.norm(b_np)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    similarity = dot_product / (norm_a * norm_b)
    return float(similarity)
