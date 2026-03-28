# Capstone Project: PersonaBot PPT & Backend Analysis

This plan outlines the analysis of the current PersonaBot backend and the structure for the Capstone Project Presentation (PPT).

## User Review Required

> [!IMPORTANT]
> The presentation structure below is a proposal. Please review the slide sequence and content focus.
> If you have specific university requirements for the PPT (e.g., specific number of slides, required sections like 'Literature Review'), please let me know.

## Backend Analysis

### Current State (Phase 1 - Completed)
- **Architecture**: Decoupled FastAPI (Backend) and Next.js (Frontend).
- **Core Features**:
    - **Ingestion Pipeline**: Automated processing of diverse data sources.
    - **Persona Creation**: Customization of AI personality and knowledge base.
    - **Chat Interface**: High-performance, real-time RAG-based chat using **Server-Sent Events (SSE)** for token-by-token streaming.
- **Task Processing**: `anyio` base async processing in `ingestion_worker.py`. 
- **Authentication**: JWT-based, using Supabase JWKS for secure token verification.
- **RAG Pipeline**:
    - **OCR**: `EasyOCR` and `PyMuPDF` for document processing.
    - **Embeddings**: `Nomic` (V2) via LangChain.
    - **Vector Storage**: Supabase (PostgreSQL with `pgvector`).
    - **Conversation Context**: Implemented a **Top-5 Message Rolling Window** to maintain persistent chat context and session memory.

### Future Enhancement & Robustness (Phase 2 - Ongoing)
- **Live Talk Interaction**: Real-time voice interaction system via **WebSockets**.
    - **STT**: **Deepgram** (Ultra-low latency Speech-to-Text).
    - **TTS**: **ElevenLabs** (English) & **Sarvam AI** (Hindi/Indic languages).
- **RAG Optimization (Reranking)**: Implementing a **Two-stage Retrieval** process.
    - Stage 1: Retrieve top 15 similar chunks via pgvector.
    - Stage 2: Use a **Reranking Model** to filter and keep the definitive top 5 chunks.
- **Product Features**:
    - **Session History**: Persistent per-bot chat history for personalized user context.
    - **Monetization**: Cashfree integration with "Free vs Paid" options for bot owners.
- **Advanced OCR**: Tesseract API for high-accuracy scanned PDF processing.

---

## Frontend UI/UX Analysis
- **Design Aesthetic**: "Modern Premium" with a focus on a **Warm Light-Mode** experience.
- **Visual Branding**: Vibrant orange-to-pink gradients (`#fb923c` to `#ec4899`) used for interactive elements, titles, and custom scrollbars.
- **Color Palette**: High-energy warm tones (Orange-50 background, Orange-400/500 and Pink-500 accents).
- **Tech Stack**: Next.js 15, Tailwind CSS 4, Framer Motion for micro-animations.
- **Philosophy**: Minimalist layout with focus on speed and "App-like" feel, utilizing backdrop blurs and floating card elements.

---

## Proposed PPT Structure (10 Slides)

### 1. Title Slide
- Project Name: **PersonaBot: AI-Powered Knowledge Base & Custom Personas**
- Subtitle: A Multi-tenant RAG-based Chatbot Platform
- Name, Degree, College/University

### 2. Introduction & Problem Statement
- **Problem**: Information overload in large documents; loss of personal touch in generic AI assistants.
- **Solution**: A platform to build "Personas" that "know" specific documents (PDF, Web, Docs) and speak with unique voices.

### 3. Key Features
- **Custom Personas**: Create unique AI personalities.
- **Advanced RAG**: Context-aware chat using uploaded documents.
- **Ingestion Pipeline**: Multi-format support (PDF, Web Scraping).
- **Voice Synthesis**: Interactive voice-based interactions.
- **Admin Dashboard**: Analytics and persona management.

### 4. System Evolution: Phases I & II
- **Phase I (The Foundation)**: 
  - Automated Ingestion Pipeline.
  - Persona Knowledge Base Construction.
  - Interactive RAG-based Chatbot Creation.
- **Phase II (Scaling & Robustness)**:
  - **Live Talk**: Real-time voice interaction system.
  - **Distributed Architecture**: Celery & RabbitMQ for heavy lifting.
  - **Advanced OCR**: Tesseract integration.

### 5. Monetization Strategy: Cashfree & Subscriptions
- **Gateway**: Cashfree Payment Integration for secure transactions.
- **Business Model**: 
  - Time-limited subscription access.
  - **Creator Empowerment**: Bot owners can choose to set their persona as 'Free' or 'Paid'.
- **Revenue Flow**: Integrated payment handling via a dedicated Subscription Service.

### 6. Technical Stack: Communication & AI
- **Chat Mode**: **Server-Sent Events (SSE)** for token streaming.
- **Live Mode**: **WebSockets** + **Deepgram** (STT) + **ElevenLabs/Sarvam AI** (TTS).
- **RAG Optimization**: **Reranking Model** (Two-stage: Retrieve 15 -> Rerank 5).
- **Security**: JWT-based auth and Supabase Row Level Security (RLS).

### 7. Implementation Details: RAG Pipeline

### 8. Enhanced OCR with Tesseract API
- Integration of a dedicated Tesseract service for high-quality scanned document processing.
- Separation of concerns: API backend vs. Processing backend.

### 9. Deployment & Infrastructure
- **Frontend**: **Vercel**
    - Optimized for Next.js App Router and Edge Functions.
- **Backend**: **AWS EC2 (Two Instances)**
    - Two dedicated EC2 nodes to handle higher concurrency and provide basic high availability (HA).
    - Future integration with Auto Scaling Groups (ASG) and ELB (Elastic Load Balancing).
- **Task Queue**: Managed via RabbitMQ/Celery workers on EC2.

### 10. Conclusion & Q&A
- Summary of the multi-tenant PersonaBot platform.
- Live Q&A and demo session.

---

## Verification Plan

### Manual Verification
- Review the `backend/` folder to ensure all listed technologies match the code.
- Validate the proposed architecture diagram against the existing project structure.
- Check `backend/requirements.txt` to confirm existing libraries.

### Artifacts to be created
- **Capstone_PPT_Content.md**: Detailed bullet points for each slide so you can copy-paste them into PowerPoint.
- **Architecture_Diagram.mermaid**: A mermaid diagram for the "Current vs Future" architecture.
