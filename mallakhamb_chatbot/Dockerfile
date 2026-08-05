# Dockerfile for Mallakhamb Chatbot (Flowise RAG Setup)
FROM flowiseai/flowise:latest

# Set working directory
WORKDIR /data

# Expose port 3000 for Flowise UI and API
EXPOSE 3000

# Set default environment variables
ENV PORT=3000
ENV FLOWISE_PATH=/root/.flowise

# Start Flowise engine
ENTRYPOINT ["/bin/sh", "-c", "sleep 3; flowise start"]
