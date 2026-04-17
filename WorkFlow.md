PersonaBot Codebase Overview
This document provides a high-level summary of the PersonaBot project, detailing its architecture, technology stack, and key components.

Architecture
The project follows a modern full-stack architecture with a decoupled frontend and backend.

Frontend: A Next.js application written in TypeScript (App Router), focused on providing a high-performance, interactive user experience.
Backend: A FastAPI (Python) service that handles AI logic, document processing, and database interactions.
Database: PostgreSQL (via Supabase) utilizing pgvector for efficient vector similarity searches.
Technology Stack
Frontend
Framework: Next.js (React 19, App Router)
Styling: Tailwind CSS 4
Animations: Framer Motion
Icons: Lucide React, React Icons
State/Data: Axios, Next.js standard fetch for RSCs.
Backend
Web Framework: FastAPI
AI Orchestration: LangChain
LLM Provider: Groq
Embeddings: Nomic
OCR/Document Processing: EasyOCR, PyMuPDF (fitz)
Voice Synthesis: ElevenLabs
Database ORM: SQLAlchemy
Vector Storage: Supabase with pgvector
Key Components
1. Ingestion Pipeline (backend/rag/)
The ingestion pipeline is responsible for processing documents and making them searchable.

processors/: Specialized processors (likely for PDF/Text).
chunking.py: Splits documents into manageable pieces for embedding.
embeddings.py: Interfaces with Nomic to generate vector representations of text.
ingestion.py: Coordinates the end-to-end process of OCR, chunking, and storing in Supabase.
2. Retrieval & RAG (backend/rag/)
retrieval.py: Implements the logic to search the vector database and retrieve relevant context.
context_builder.py: Formats retrieved chunks for the LLM prompt.
3. API Layer (backend/api/)
main.py: Entry point for the FastAPI application.
routers/: Contains the definition of various API endpoints (Auth, RAG, Voice, etc.).
schemas/: Pydantic models for request and response validation.
4. Database Layer (backend/database/)
models.py: Defines the data models for Users, Personas, Documents, and Embeddings. (Investigating currently...)
queries.py: Common SQL/ORM queries.
Project Structure Highlights
Frontend
/src/app/chat: Chat interface.
/src/app/dashboard: User dashboard.
/src/app/explore: Persona discovery/exploration.
/src/app/onboarding: User setup flow.
Backend
/rag: RAG-related logic.
/api: FastAPI endpoints.
/voice: ElevenLabs integration.
/workers: Background tasks (likely for document processing).

---

## Deep Dive: API Flows

### 1. Ingestion API Flow (`/api/routers/ingestion.py`)
The ingestion process is heavily optimized for fast API responses and robust background processing:
1. **Endpoint Initialization**: A `POST /{bot_id}/batch` request receives a batch of data sources (PDFs, images, links, text) via multipart form data alongside a JSON metadata payload.
2. **Security & Validation**: Checks `alumni` role authorization and verifies bot ownership via JWT tracking.
3. **Storage & Caching**: 
   - Media files (PDFs/Images) are read into memory.
   - The files are asynchronously uploaded to **Cloudinary** for permanent storage.
   - The raw byte streams are cached in a temporary memory dictionary (`file_payloads`) to avoid re-downloading them in the worker layer.
4. **Database State**: Creates a `pending` batch record and individual source records in Supabase.
5. **Background Handoff**: The heavy lifting is delegated to a FastAPI `BackgroundTasks` function (`process_batch`), which hands the cached bytes directly to the **Celery worker queue** (via RabbitMQ) for OCR (Tesseract), chunking (LangChain), and vector embeddings (Nomic). The API returns immediately.
6. **Real-Time Updates Flow**: A dedicated WebSocket endpoint (`/batch/{batch_id}/ws`) polls the database every 1.5 seconds and emits live status updates (processed vs total files, individual source status, errors) to the frontend until the batch hits a terminal state (completed/failed).
7. **Data Deletion**: `DELETE` endpoints utilize Postgres `ON DELETE CASCADE` to cleanly wipe vector chunks automatically when a source is removed.

### 2. Retrieval & Chat API Flow (`/api/routers/chat.py`)
The chat API prioritizes extremely low-latency, real-time responses using streaming and aggressive caching:
1. **Endpoint Initialization**: A `POST /{bot_id}` request is hit. It is protected by a robust **SlowAPI Rate Limiter** (`@limiter.limit`). This limiter utilizes a custom `FallbackStorage` class that primarily uses **Redis** for distributed rate-limiting, but gracefully degrades to local memory (`MemoryStorage`) if the Redis connection drops, ensuring the API remains highly available.
2. **Verification**: Validates that the persona is active ("ready") or belongs to the author.
3. **Semantic Search (RAG)**: The user's query is converted to an embedding and queried against Supabase `pgvector` (`retrieve_similar_chunks`), retrieving the top `K` most relevant knowledge chunks via cosine similarity.
4. **Rolling Memory via Redis Cache**:
   - Queries a **Redis cache** for the user's last 5 messages with this specific bot.
   - **Cache Miss**: Hits Supabase `get_recent_messages`, then writes the result to Redis with a 1-hour expiration.
   - **Cache Hit**: Instantly loads the conversation history.
5. **Prompt Engineering**: The retrieved text chunks and the bot's custom `persona_config` (identity, rules, tone) are compiled into a strict LangChain System Prompt using `build_context`.
6. **Optimistic Persistence**: The incoming user message is saved to Supabase and optimistically appended to the Redis history cache to maintain strict ordering.
7. **SSE Streaming Flow**: 
   - Groq's Llama 3.3 70B model (`ChatGroq`) is invoked with the combined context + history + query.
   - Tokens are yielded back to the Next.js frontend in real-time via **Server-Sent Events** (`text/event-stream`).
8. **Final State Save**: Upon stream completion, the full AI response is saved to Supabase and pushed to the Redis rolling window cache to persist context for the next query.

---

### Backend Authentication & Storage RLS

For a secure, production-level implementation using **Supabase + FastAPI** (without a Service Role key), follow these patterns:

#### 1. Adaptive JWT Verification (JWKS)
*   **Problem**: Modern Supabase projects use **ES256 (ECC)** keys, while legacy ones use HS256. 
*   **Solution**: Use **JWKS Auto-Discovery**. The backend fetches public keys from `https://<ref>.supabase.co/auth/v1/.well-known/jwks.json`.
*   **Benefit**: This handles rotating keys automatically and verifies tokens using the standard OpenID Connect pattern.

#### 2. Threading the User JWT (RLS)
*   **Problem**: In FastAPI, a global Supabase client uses the `anon` key, which has no "User Identity". This causes `42501` errors because `auth.uid()` returns null.
*   **Solution**: Extract the raw JWT from the request header in `get_current_user` and pass it down to your queries.
*   **Implementation**: Create a per-request client using `client.postgrest.auth(token)`. This "impersonates" the user, making RLS policies work perfectly.

#### 3. Storage Upload via HTTPX
*   **Problem**: The `supabase-py` v2 storage client does **not** inherit authentication from the main client's `auth()` call. This leads to `403 Forbidden` if your bucket has RLS policies.
*   **Solution**: Use a direct `httpx` POST call to the Supabase Storage API. 
*   **Crucial Headers**:
    ```python
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "image/jpeg"
    }
    ```
*   **Benefit**: This ensures the `Authorization` header is actually sent, allowing `auth.uid()` to resolve in your Storage RLS policies.

#### 4. Storage RLS Policy Gotchas
*   **Path Structure**: Use `{user_id}/{filename}` inside the bucket. 
*   **Policy Logic**: Use `(storage.foldername(name))[1]` to extract the user ID. 
*   **Index Note**: PostgreSQL arrays are 1-indexed. If the path is `user_id/file.jpg`, index `[1]` is the user ID. Don't prefix with the bucket name in the path string, as the bucket name is already part of the URL.


### 🚀 Seamless Production Deployment
We utilize a **Docker-first** approach to ensure environment parity between local development and AWS EC2 production. 

- **Static Infrastructure**: The frontend is deployed via Vercel for Edge-optimized performance.
- **Containerized Backend**: FastAPI and its ingestion workers are bundled into a single **Docker Image**, pre-configured with Tesseract and system-level OCR dependencies.
- **Registry**: Images are pushed to `dynamicphillic` for automated pulls on production nodes.

### Docker Deployment Commands
To build and push images for **dynamicphillic**:

#### 1. Backend API
```powershell
docker build -t dynamicphillic/personabot-api ./backend
docker push dynamicphillic/personabot-api
```

#### 2. Frontend Web
```powershell
docker build -t dynamicphillic/personabot-web ./frontend
docker push dynamicphillic/personabot-web
```

#### 3. Run Locally with Compose
```powershell
docker-compose up --build
```
