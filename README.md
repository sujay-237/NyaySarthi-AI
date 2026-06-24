# NyaySarthi AI v2

A full-stack AI-powered legal document analysis application with **3D animated UI**, **multi-LLM provider support**, and **enhanced features**.

## Architecture

```
S:\Projects\NyaySarthi AI\
├── backend\          # FastAPI (Python)
│   ├── app\
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers\    # API endpoints
│   │   │   ├── analyze.py
│   │   │   ├── chat.py
│   │   │   ├── providers.py
│   │   │   └── history.py
│   │   ├── services\    # LLM integrations
│   │   │   ├── gemini.py
│   │   │   ├── groq.py
│   │   │   ├── ollama.py
│   │   │   └── document.py
│   │   └── models\
│   │       └── schemas.py
│   ├── requirements.txt
│   └── .env
├── frontend\         # React + TypeScript + Vite
│   ├── src\
│   │   ├── components\  # UI components
│   │   ├── hooks\       # React hooks
│   │   ├── services\    # API client
│   │   ├── utils\       # i18n, exporters
│   │   ├── types\       # TypeScript types
│   │   └── styles\      # Tailwind CSS
│   ├── index.html
│   └── package.json
└── .env.example
```

## Features

### Core (from v1)
- **Instant Summaries** — AI-powered legal document summarization
- **Key Clause Explanations** — Identifies and explains important clauses with severity ratings
- **Interactive Q&A** — Follow-up chat about the analyzed document
- **Multi-Language** — English, Hindi, Bengali, Marathi, Tamil, Malayalam
- **Dark/Light Mode** — Theme toggle with system preference detection
- **Export & Share** — Copy, email, Markdown, and text export

### New in v2
- **Multi-Provider LLM Support** — Switch between Google Gemini, Groq, and Ollama (local)
- **3D Animated Background** — Three.js particle system with neural network visualization
- **Streaming Chat Responses** — Real-time AI chat with typing effect
- **Voice Input** — Web Speech API for voice-to-text queries
- **Provider Health Check** — Real-time availability status for each LLM provider
- **Server-Side History** — Backend session history management
- **Advanced Export** — Markdown and plain text export
- **Glass-Morphism UI** — Modern frosted-glass design with backdrop blur
- **Splash Screen** — Animated loading screen with GSAP

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python) + Pydantic |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Animation | Framer Motion + GSAP |
| Icons | Lucide React |

## Setup

### 1. Clone & Navigate

```bash
cd "S:\Projects\NyaySarthi AI"
```

### 2. Configure Environment

Copy the example `.env` file and fill in your API keys:

```bash
copy .env.example backend\.env
```

Edit `backend\.env`:

```ini
# Required: Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# Optional: Get from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key

# Optional: Ollama runs locally by default
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd ..\frontend
npm install
```

### 5. Build Frontend

```bash
npm run build
```

### 6. Start Backend

```bash
cd ..\backend
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 7. Start Frontend (Dev Mode)

```bash
cd ..\frontend
npm run dev
```

The backend runs on **http://localhost:8001** and the frontend dev server on **http://localhost:5173**.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Analyze document (multipart with text, files, provider, model, language) |
| POST | `/api/chat` | Stream chat responses (SSE) |
| GET | `/api/providers` | List available LLM providers |
| GET | `/api/history` | Get analysis history |
| POST | `/api/history` | Add history item |
| DELETE | `/api/history` | Clear history |

## LLM Providers

### Google Gemini
- **Model**: `gemini-2.5-flash-preview-05-20`
- **Setup**: Add `GEMINI_API_KEY` to `.env`
- **Best for**: Fast, high-quality analysis

### Groq
- **Model**: `llama-3.3-70b-versatile`
- **Setup**: Add `GROQ_API_KEY` to `.env`
- **Best for**: High throughput, low latency

### Ollama (Local)
- **Model**: `llama3.2` (or any locally installed model)
- **Setup**: Install [Ollama](https://ollama.com/) and run `ollama pull llama3.2`
- **Best for**: Privacy, offline use, no API costs

## Project Structure Details

### Backend (`backend/`)
- `app/main.py` — FastAPI app with CORS, route registration, and static files
- `app/config.py` — Pydantic settings with `.env` support
- `app/routers/` — API route handlers (analyze, chat, providers, history)
- `app/services/` — LLM integrations (Gemini, Groq, Ollama) + document extraction
- `app/models/schemas.py` — Pydantic request/response models

### Frontend (`frontend/`)
- `src/components/` — React components (ThreeBackground, SplashScreen, Header, DocumentInput, AnalysisPanel, ChatPanel, etc.)
- `src/hooks/` — Custom hooks (useTheme, useLanguage, useAnalysis, useChat)
- `src/services/api.ts` — Fetch wrapper for all backend APIs
- `src/utils/i18n.ts` — 6-language translation dictionary
- `src/utils/exporters.ts` — Markdown, text, clipboard, and download utilities
- `src/types/index.ts` — TypeScript interfaces for the entire app

## License

MIT License — NyaySarthi AI by Claritas Tech
