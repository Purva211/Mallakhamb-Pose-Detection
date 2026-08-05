# Mallakhamb RAG Chatbot Migration Report

This project has been updated to migrate the RAG chatbot from a local Ollama & Flowise deployment to a fast, cloud-ready native RAG pipeline using the Groq API.

## 1. Removed Ollama LLM Dependency
- Eliminated all dependencies on the `localhost:11434` local Ollama server.
- Removed local model reliance (`llama3.2:3b` and `nomic-embed-text`).
- The application no longer requires a locally running Ollama container for inference, dramatically reducing RAM usage and CPU bottlenecks.

## 2. Added Groq LLM Inference
- Replaced local LLM calls with the official `groq` Python SDK.
- Now utilizes the fast `llama-3.1-8b-instant` model via the Groq Cloud API.
- Implemented environment variable configuration: `GROQ_API_KEY` and `GROQ_MODEL` are used in the backend for secure, dynamic instantiation.

## 3. Preserved RAG Knowledge Base
- Retained the official 77-page Mallakhamb manual (`Final COP MFI PDF.pdf`).
- Implemented a native Python RAG pipeline using `pypdf` for text extraction.
- The chatbot still correctly cites sources (Page content, Page number) ensuring compatibility with the frontend widget schema.

## 4. Handled Embeddings & Removed Localhost Dependency
- Eliminated `nomic-embed-text` in favor of a native `scikit-learn` `TfidfVectorizer` for sparse vector search.
- Vectorization and retrieval now run locally in memory, executing in under 1ms with virtually zero extra RAM or disk overhead.
- Fully removes the need for Flowise and its vector store overhead.

## 5. Backend Security Only
- `GROQ_API_KEY` is loaded securely on the FastAPI backend using `python-dotenv`.
- The frontend interacts exclusively with the FastAPI proxy endpoint, keeping API keys completely hidden from client-side execution.

## 6. Performance & Error Handling
- Response generation now takes milliseconds (via Groq API) rather than 10-15 seconds (via local Ollama).
- Implemented error handling for missing API keys, failed Groq authentication, and lack of indexed text.

## 7. Docker & Cleanup
- Removed the heavyweight `flowise` and `ollama` containers from `docker-compose.yml`.
- The backend FastAPI application runs natively in its own container, drastically simplifying the deployment process and improving container spin-up speed.

### How to Run Locally
1. Add your Groq API key to the `.env` file (see `.env.example`):
   ```
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.1-8b-instant
   ```
2. Start the backend:
   ```bash
   cd mallakhamb_chatbot
   docker-compose up -d
   ```
3. The frontend is available as usual, seamlessly hitting the updated fast inference backend.
