"""
Hugging Face embeddings using sentence-transformers
"""
from sentence_transformers import SentenceTransformer
import numpy as np

class Embedder:
    """Generate embeddings using Hugging Face models"""
    
    def __init__(self, model_name='sentence-transformers/all-MiniLM-L6-v2'):
        """
        Initialize embedder with Hugging Face model
        
        Args:
            model_name: Model identifier from Hugging Face
        """
        print(f"🤖 Loading embedder model: {model_name}...")
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"✅ Embedder loaded. Embedding dimension: {self.embedding_dim}")
    
    def embed_text(self, text):
        """
        Generate embedding for text
        
        Args:
            text: Text to embed
            
        Returns:
            np.ndarray: Embedding vector
        """
        if not text or not text.strip():
            print("⚠️  Empty text provided, returning zero vector")
            return np.zeros(self.embedding_dim)
        
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding
        except Exception as e:
            print(f"❌ Embedding error: {str(e)}")
            raise Exception(f"Failed to generate embedding: {str(e)}")
    
    def embed_batch(self, texts):
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of texts
            
        Returns:
            np.ndarray: Array of embeddings
        """
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings
        except Exception as e:
            print(f"❌ Batch embedding error: {str(e)}")
            raise Exception(f"Failed to generate batch embeddings: {str(e)}")
    
    def get_embedding_dim(self):
        """Get embedding dimension"""
        return self.embedding_dim
