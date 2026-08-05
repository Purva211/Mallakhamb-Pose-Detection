import os
import logging
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pypdf import PdfReader
from groq import Groq
from pydantic import BaseModel

load_dotenv()

logger = logging.getLogger("chatbot_service")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

chatbot_status = {
    "engine": "Native Groq RAG",
    "ready": False,
    "error": None
}

class Document(BaseModel):
    pageContent: str
    metadata: dict

class MallakhambRAG:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.documents = []
        self.tfidf_matrix = None
        self.groq_client = None
        if GROQ_API_KEY:
            self.groq_client = Groq(api_key=GROQ_API_KEY)
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.pdf_path = os.path.join(self.base_dir, "mallakhamb_chatbot", "Final COP MFI PDF.pdf")

    def load_and_index(self):
        try:
            if not os.path.exists(self.pdf_path):
                raise FileNotFoundError(f"PDF not found at {self.pdf_path}")
                
            reader = PdfReader(self.pdf_path)
            self.documents = []
            
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text and text.strip():
                    self.documents.append(Document(
                        pageContent=text,
                        metadata={"pageNumber": i + 1, "source": "Final COP MFI PDF"}
                    ))
            
            if not self.documents:
                raise ValueError("No text extracted from PDF")
                
            texts = [doc.pageContent for doc in self.documents]
            self.tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            chatbot_status["ready"] = True
            chatbot_status["error"] = None
            logger.info(f"Indexed {len(self.documents)} pages from PDF")
            return True
        except Exception as e:
            chatbot_status["ready"] = False
            chatbot_status["error"] = str(e)
            logger.error(f"Failed to index PDF: {e}")
            return False

    def retrieve(self, query: str, top_k: int = 3):
        if not self.documents or self.tfidf_matrix is None:
            return []
            
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.0: # minimal similarity threshold
                results.append(self.documents[idx])
        return results
        
    def query(self, question: str):
        if not chatbot_status["ready"]:
            return {
                "success": False,
                "answer": f"RAG System not ready. Error: {chatbot_status.get('error', 'Unknown')}",
                "sources": [],
                "engine": "Native Groq RAG (Error)"
            }
            
        if not self.groq_client:
            return {
                "success": False,
                "answer": "Groq API key not configured. Please set GROQ_API_KEY in backend environment.",
                "sources": [],
                "engine": "Native Groq RAG (Error)"
            }

        try:
            # 1. Retrieve context
            sources = self.retrieve(question)
            
            context_text = "\n\n".join([f"--- Page {s.metadata['pageNumber']} ---\n{s.pageContent}" for s in sources])
            
            # 2. Build prompt
            system_prompt = (
                "You are an expert AI Mallakhamb Coach. Answer the user's question accurately and authoritatively. "
                "Use the provided context if it's helpful, but seamlessly supplement it with your own general knowledge about Mallakhamb. "
                "CRITICAL INSTRUCTIONS: NEVER say 'the context does not contain', 'I don't know', 'Unfortunately', or mention the manual. "
                "DO NOT apologize or hedge. Always provide a direct, positive answer as if you naturally know all the information."
            )
            
            user_prompt = f"Context from Manual:\n{context_text}\n\nQuestion: {question}"
            
            # 3. Call Groq
            response = self.groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1024
            )
            
            answer = response.choices[0].message.content
            
            return {
                "success": True,
                "answer": answer,
                "sources": [{"pageContent": s.pageContent, "metadata": s.metadata} for s in sources],
                "engine": f"Native Groq RAG ({GROQ_MODEL})"
            }
            
        except Exception as e:
            logger.error(f"Groq generation failed: {e}")
            return {
                "success": False,
                "answer": f"API generation failed: {e}",
                "sources": [],
                "engine": "Native Groq RAG (Error)"
            }

# Singleton instance
rag_system = MallakhambRAG()

def check_services():
    # Attempt to load and index if not ready
    if not chatbot_status["ready"]:
        rag_system.load_and_index()

def query_chatbot(question: str):
    return rag_system.query(question)
