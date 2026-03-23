# 🧠 PersonaBot – Human Persona AI Platform

A real-time AI platform where alumni and professionals can create their own AI chatbot representing their knowledge, experience, and personality. Other users can interact with these bots via text or live voice mode.

## ✨ Features

- **Multi-Bot Creation** – Each user creates their own AI persona.
- **Advanced Ingestion** – Automated OCR for scanned PDFs using `PyMuPDF` + `EasyOCR`.
- **RAG Pipeline** – State-of-the-art `Nomic V2 (768d)` embeddings with `pgvector` similarity search.
- **Groq Integration** – Lightning-fast LLM responses using `llama3-8b-8192`.
- **Multi-Tenant Safety** – Complete data isolation via `bot_id` filtering in all vector queries.
- **Docker-Ready** – Streamlined backend container with Tesseract/EasyOCR dependencies.

## 🏗️ Architecture

```
Frontend (Next.js + TypeScript - Vercel)
         |
     Nginx (AWS EC2)
         |
     FastAPI (Docker)
         |
------------------------------
| RAG | Voice | Auth | Chat |
------------------------------
         |
   Supabase + pgvector (Nomic V2)
         |
   Groq Cloud (Llama 3) + ElevenLabs
```

## 📁 Project Structure

```
persona_ai_capstone/
├── frontend/          # Next.js 14+ (App Router, Tailwind, TypeScript)
├── backend/           # FastAPI (Python 3.11)
│   ├── api/           # Routers (auth, bots, documents, chat, voice)
│   ├── core/          # Config, security, utils
│   ├── database/      # Models, queries, migrations (RLS + pgvector)
│   ├── rag/           # Ingestion (OCR), chunking, embeddings, retrieval
│   ├── voice/         # STT, TTS (ElevenLabs), WebRTC
│   └── workers/       # Asynchronous ingestion processing
├── .env.example       # Template for keys (Supabase, Groq, OpenAI)
└── README.md
```

## 🚀 Quick Start

### 1. Database Setup
Enable `pgvector` and create the schema by running the SQL in [supabase_schema.sql](file:///c:/Mern%20Stack/persona_ai_capstone/backend/database/supabase_schema.sql).

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔌 API Testing (Postman)
**POST** `/api/documents/{bot_id}/upload`
- Body: `form-data` with `file` (PDF)
- Returns: `{"status": "ingested", "chunks": X, "method": "EasyOCR"}`

## 📄 License
MIT
