# AgriVoice — MVP README

> **Voice-first farm advisor (MVP)** — lightweight, multilingual, and deployable as web widget, WhatsApp voice bot, or IVR. This README guides developers and stakeholders through setup, architecture, deployment, and next steps.

---

## Table of contents

1. Project overview
2. MVP scope & user stories
3. Architecture diagrams (mermaid)
4. Tech stack & rationale
5. Quickstart — run locally (dev) + Docker
6. API spec (routes, payloads)
7. Data models
8. STT / LLM / TTS microservice implementations
9. UI wireframes & visualizations
10. Deployment & hosting
11. Cost estimate & pricing recommendation
12. Testing plan
13. Monitoring & analytics
14. Roadmap & Phase 2 features
15. Appendix: useful commands & references

---

## 1. Project overview

**Goal:** Build an MVP voice assistant for farmers that understands voice queries in local languages and replies with spoken guidance. The MVP targets a farming NGO or regional agri-extension service and supports a web widget + WhatsApp voice channel.

**Primary users:** Farmers (voice-first), Field Officers (dashboard), Admins (analytics).

**Success metrics for MVP:**

* 80%+ intelligible voice roundtrips for target language(s)
* 70% user satisfaction in pilot (survey)
* Ability to handle 100 concurrent short sessions

---

## 2. MVP scope & user stories

**MVP features**

* Voice capture on web widget (one language: e.g., Hindi/Telugu)
* STT microservice (Whisper local or hosted) to transcribe audio
* LLM-based advisory microservice (domain prompts + fallback)
* TTS microservice to convert LLM response to audio
* Simple web UI: voice button, transcript, audio playback
* Admin dashboard: interaction list, top queries, geo summary
* Optional WhatsApp voice channel (Cloud API + webhook)

**Example user stories**

* As a farmer, I can ask "क्या मेरी फसल में पौधों पर कीट हैं?" and receive a voice response telling likely pests and suggested next steps.
* As an admin, I can view daily top 10 queries and export CSV.

---

## 3. Architecture diagrams

```mermaid
flowchart LR
  A[Farmer Browser / WhatsApp / IVR] -->|audio| B[STT Service]
  B -->|text| C[LLM + Knowledge DB]
  C -->|text| D[TTS Service]
  D -->|audio| A
  C -->|analytics| E[Dashboard & DB]
  subgraph Infra
    B
    C
    D
    E
  end
```

**Sequence (short)**

```mermaid
sequenceDiagram
  participant U as User (voice)
  participant W as Web Widget / WhatsApp
  participant S as STT Service
  participant L as LLM Service
  participant T as TTS Service
  U->>W: speaks audio
  W->>S: upload/stream audio
  S->>L: transcript
  L->>L: consult knowledge DB
  L->>T: answer text
  T->>W: audio response
  W->>U: play audio
```

---

## 4. Tech stack & rationale

* Frontend: **Next.js (React)** — server-side rendering optional, easy to host
* STT: **Whisper (local)** for offline-first; **OpenAI/Whisper API** or **Coqui** for hosted
* LLM: **OpenRouter** (Mixtral/GPT-family) or self-hosted **Llama-3** family for cost control
* TTS: **Coqui / Bark / ElevenLabs** (Coqui recommended for open-source)
* Backend: **FastAPI** (Python) — async friendly, easy to integrate with ML
* DB: **MongoDB Atlas** for flexible schemas (interactions, users)
* Message queue: **Redis** (optional) for audio processing pipelines
* Hosting: **Railway / Render / DigitalOcean / AWS ECS** depending on scale

---

## 5. Quickstart — run locally (dev) + Docker

### Prereqs

* Node 18+, Python 3.11+, Docker (optional), Git
* Environment: `.env` file (see *Appendix*)

### Clone

```bash
git clone https://your-repo/agri-voice.git
cd agri-voice
```

### Run backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Run frontend (Next)

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

### Run STT locally (Whisper) — simple endpoint example

1. Create `stt_service/app.py` (example included in repo)
2. Install whisper: `pip install -U openai-whisper torch` (or use faster `whisperx`/gpu)
3. Start STT worker: `python app.py`

> NOTE: The repo includes minimal example services for STT, TTS, and LLM glue.

### Docker (single host dev)

A `docker-compose.dev.yml` is included to run the backend, frontend, and MongoDB locally.

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 6. API spec (selected endpoints)

### POST `/api/v1/audio/upload`

* Purpose: upload voice clip from web widget
* Payload: multipart/form-data: `file: audio/wav` + `lang`
* Response: `{ "session_id":"...", "transcript":"...", "status":"queued" }`

### GET `/api/v1/session/{id}`

* Purpose: poll for status and audio response URL
* Response: `{ "transcript":"...","answer_audio_url":"/media/res1.mp3","raw_answer":"..." }`

### POST `/webhook/whatsapp` (WhatsApp Cloud webhook)

* Purpose: receive incoming voice messages from WhatsApp
* Payload: WhatsApp webhook payload (audio url). The backend downloads audio and processes.

### Admin GET `/admin/interactions?from=2025-10-01&to=2025-10-05`

* Response: interactions list, aggregations

---

## 7. Data models (MongoDB)

```json
// interactions collection
{
  "_id": "uuid",
  "user_phone": "+91...",
  "session_id": "...",
  "transcript": "...",
  "language": "hi",
  "answer_text": "...",
  "answer_audio_path": "/media/...",
  "intent": "pest_report",
  "tags": ["pest","maize"],
  "created_at": "2025-10-05T05:00:00Z"
}
```

User profile (simplified): phone, preferred language, village geo, crops

---

## 8. STT / LLM / TTS microservices (implementation notes)

### STT

* **Local quick:** Whisper running as a REST microservice. Accepts wav/m4a. Returns transcript and word timestamps.
* **Production:** Use whisper API or coqui to reduce maintenance.
* **Optimization:** Silence trimming, VAD (webrtcvad) to minimize audio length.

### LLM advisory service

* **Prompt design:** System prompt should include: region, soil type, crop calendar, pest DB, and answer style (short, actionable steps, safety). Use retrieval augmentation for KB lookups.
* **Fallbacks:** If LLM is uncertain, return: "Please share an image of the problem or contact extension officer." and optionally offer IVR callback.

### TTS

* Prefer streaming TTS for low latency.
* Use language-custom voice if available.

---

## 9. UI wireframes & visualizations

### Web widget layout

* Big circular microphone button
* Live waveform animation while recording
* Transcript below the button
* Playback button for response
* Language switcher

```mermaid
flowchart LR
  Widget[Web Widget] --> Mic[Record] --> Upload[/api/v1/audio/upload]
  Upload --> Spinner[Processing]
  Spinner --> Player[Play Audio]
```

### Admin dashboard visuals (charts)

* Daily interactions (line chart)
* Top queries (bar chart)
* Language distribution (pie chart)
* Geo heatmap of interactions

> The repo includes example Chart.js code and a mocked dataset to preview visuals.

---

## 10. Deployment & hosting

**Minimum viable deployment (low-cost)**

* Backend & Worker: single small VPS (2 vCPU, 4GB) or Render service — $10–$25/month
* MongoDB Atlas free tier -> upgrade to M0/M2 as needed ~ $9+/month
* STT worker: if using local whisper, deploy on separate machine with GPU for scale; otherwise use API
* Domain + TLS: Let's Encrypt (free)

**Scaling notes**

* Offload heavy work to asynchronous workers (Redis + Celery/RQ)
* Use object storage (S3/DigitalOcean Spaces) for audio files
* Autoscale LLM endpoints or use rate-limited third-party LLM provider

---

## 11. Cost estimate & pricing guidance (MVP)

**Monthly infra (approx)**

* Small setup, open-source (Whisper local): $20–$40
* Hosted LLM & TTS heavy usage: $100–$300
* WhatsApp / IVR usage: variable ($0.005–$0.02 per minute/message)

**Recommended client pricing (MVP)**

* One-time development: **₹60,000 – ₹90,000**
* Optional hosting & support: **₹2,000 – ₹6,000/month**

---

## 12. Testing plan

* Unit tests for backend endpoints
* Integration test: record sample audio -> transcript -> LLM -> TTS -> playback
* Pilot testing (5–10 farmers) to gather real transcripts and tune STT
* Language accuracy A/B tests for TTS voice variants

---

## 13. Monitoring & analytics

* Use Prometheus + Grafana or a hosted monitoring service to track latency, error rates
* Track business KPIs in the dashboard (successful responses, user dropouts, unanswered queries)

---

## 14. Roadmap & Phase 2 features

* Crop image diagnosis (mobile upload + YOLO/CLIP)
* Offline-first mobile app with 1-week cached knowledge
* Voice-based forms for subsidies & scheme enrollment
* Multi-region model fine-tuning with local extension data

---

## 15. Appendix: useful commands & `.env` variables

### `.env` example

```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/agri
OPENROUTER_API_KEY=sk-xxxx
WHISPER_HOST=http://localhost:9001
TTS_PROVIDER=coqui
STORAGE_S3_ENDPOINT=https://...
```

### Useful local commands

* Start backend: `uvicorn backend.main:app --reload --port 8000`
* Start frontend: `npm run dev` in `frontend`
* Run tests: `pytest -q`

---

## Deliverables included in repo

* `frontend/` — Next.js widget & sample pages
* `backend/` — FastAPI with endpoints, admin routes
* `stt_service/` — Whisper-based microservice example
* `tts_service/` — Coqui wrapper example
* `llm_service/` — Prompt manager + retriever stub
* `docker-compose.dev.yml` & deployment templates
* Mock data for dashboard previews

