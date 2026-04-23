# 🧠 PersonaBot – Modern AI Persona Platform

PersonaBot is a high-performance, real-time AI platform designed for alumni, professors, and professionals to create personalized AI clones. These "Personas" represent their unique knowledge, experience, and conversational style, enabling students and mentees to learn from the best—anytime, anywhere.

---




## ✨ Core Features (Phase I)

- **Custom AI Personas**: Build unique AI personalities that "know" your specific documents and voice.
- **Advanced RAG Pipeline**: Utilizing **Nomic V2 (768d)** embeddings and **Supabase (pgvector)** for high-precision knowledge retrieval.
- **Automated Ingestion**: Support for PDFs, Web Scraping, and Docs with high-accuracy OCR (`EasyOCR` + `PyMuPDF`).
- **Real-time Streaming**: **Server-Sent Events (SSE)** for lightning-fast, token-by-token chat responses.
- **Conversation Context**: Persistent **Top-5 Message Rolling Window** to maintain continuity and "memory" in chats.
- **Multi-Tenant Security**: Robust data isolation using Supabase **Row Level Security (RLS)**.

---

## 🏗️ Technical Architecture

PersonaBot operates on a distributed microservices architecture designed for high availability and real-time feedback.

```mermaid
graph TD
    subgraph Client_Layer [Frontend: Next.js 15]
        UI[User Interface]
        WS_C[WebSocket Client]
    end

    subgraph API_Gateway [Backend: FastAPI]
        API[REST API]
        WS_S[WebSocket Server]
        B_TASK[Ingestion Orchestrator]
    end

    subgraph Message_Broker [CloudAMQP / RabbitMQ]
        MQ[OCR Task Queue]
    end

    subgraph Compute_Cluster [Celery Worker Cluster]
        CW[OCR Worker]
    end

    subgraph Knowledge_Stack [AI & Vector DB]
        EMB[Nomic Embeddings]
        GROQ[Groq LLM]
        PGV[Supabase pgvector]
    end

    UI -->|HTTPS| API
    UI <-->|WebSockets| WS_S
    B_TASK -->|Dispatch OCR| MQ
    MQ --> CW
    CW -->|Return Text| B_TASK
    B_TASK -->|Generate Embeds| EMB
    B_TASK -->|Store Vectors| PGV
    API -->|Prompt Context| GROQ
    WS_S -->|Poll Status| PGV
```

### 🔄 The Ingestion Pipeline (3-Pass Orchestration)
When a user uploads a document, the `ingestion_worker` handles the process in three distinct phases:

1.  **Pass 1: Text Extraction (Hybrid OCR)**
    - **Primary**: The system attempts to offload OCR to the **Celery Worker Cluster** via CloudAMQP.
    - **Fallback**: If the worker cluster is down or times out, the API performs **Local Tesseract OCR** as a failsafe.
2.  **Pass 2: Vector Embedding**
    - Text is split into chunks (1000 tokens) with overlap.
    - Chunks are sent in batches to the **Nomic AI** embedding engine.
3.  **Pass 3: Vector Storage**
    - High-dimensional vectors are stored in **Supabase pgvector** for precise retrieval.

### 📡 Real-time Progress Tracking
Unlike static upload bars, PersonaBot uses a **WebSocket + Database Polling** architecture:
- The **Ingestion Worker** updates granular source statuses (`extracting`, `embedding`, `completed`) in Supabase.
- The **WebSocket Server** polls these statuses and streams synthetic sub-step progress (e.g., 0% → 50% → 65% → 100%) to the UI.
- This ensures users see exactly what the pipeline is doing (e.g., *"Generating AI Embeddings..."*).

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS 4, Framer Motion, Lucid Icons.
- **Backend**: FastAPI, Pydantic, AnyIO.
- **Database**: PostgreSQL (Supabase) + `pgvector`.
- **Broker**: CloudAMQP (RabbitMQ) + Celery.
- **Cache/Rate Limiter**: Upstash Redis.
- **AI Models**: Groq (Llama 3), Nomic (v1.5 Embeddings).

---

## 🚀 Detailed Setup Guide

### 1. Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **Docker**: Required for seamless production deployment (Backend + Workers)
- **Accounts**: Supabase, Groq, Cloudinary.

### 2. Backend Installation
1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Setup**:
   Copy `.env.example` to `.env` and fill in the following:
   - `SUPABASE_URL` & `SUPABASE_KEY`: From your Supabase Project Settings.
   - `GROQ_API_KEY`: From Groq Cloud console.
   - `CLOUDINARY_*`: From your Cloudinary Dashboard.
   - `EMBEDDING_MODEL`: Set to `nomic-ai/nomic-embed-text-v2-moe`.

### 3. Database Migration
Enable `pgvector` in your Supabase instance and run the SQL scripts in order:
- **Schema**: [database/sql/supabase_schema.sql](file:///c:/Mern%20Stack/persona_ai_capstone/backend/database/sql/supabase_schema.sql)
- **Security (RLS)**: [database/sql/rls.sql](file:///c:/Mern%20Stack/persona_ai_capstone/backend/database/sql/rls.sql)

### 4. Frontend Installation
1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install packages**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

---

## 🏎️ Running the Project

**Start Backend**:
```bash
# Inside /backend
uvicorn main:app --reload
```

**Start Frontend**:
```bash
# Inside /frontend
npm run dev
```

---

## 🔮 Future Roadmap (Phase II)

- **Live Talk Mode**: Real-time voice interaction using **WebSockets** and **Deepgram**.
- **RAG Reranking**: Two-stage retrieval (Retrieve 15 -> Rerank top 5) for extreme accuracy.
- **Monetization**: **Cashfree** integration for "Free vs Paid" persona access.
- **Indic Language Support**: Hindi/Regional TTS via **Sarvam AI**.

---

## 📄 Documentation
- [Detailed Technical Docs](file:///c:/Mern%20Stack/persona_ai_capstone/Docs.md)
- [System Workflow](file:///c:/Mern%20Stack/persona_ai_capstone/WorkFlow.md)

## ⚖️ License
MIT
