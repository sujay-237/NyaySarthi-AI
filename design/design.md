# NyaySarthi AI v2 - Design Document

## Overview
Full-stack legal document analysis application with 3D animated UI, multi-LLM provider support, and enhanced features.

## Tech Stack

### Backend
- **FastAPI** (Python) - async web framework
- **python-multipart** - file uploads
- **httpx** - async HTTP client for external APIs
- **pydantic** - data validation
- **python-dotenv** - environment config

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** - styling
- **Three.js** + **@react-three/fiber** - 3D background
- **GSAP** - animations
- **@react-three/drei** - R3F helpers
- **framer-motion** - UI transitions
- **lucide-react** - icons

## Architecture

### Project Structure
```
S:\Projects\NyaySarthi AI\
├── backend\
│   ├── app\
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # Settings & .env
│   │   ├── routers\
│   │   │   ├── __init__.py
│   │   │   ├── analyze.py       # Document analysis
│   │   │   ├── chat.py          # Follow-up chat
│   │   │   ├── history.py       # Session history
│   │   │   └── providers.py     # LLM provider info
│   │   ├── services\
│   │   │   ├── __init__.py
│   │   │   ├── gemini.py        # Gemini API
│   │   │   ├── groq.py          # Groq API
│   │   │   ├── ollama.py        # Ollama API
│   │   │   └── document.py      # PDF/text extraction
│   │   └── models\
│   │       ├── __init__.py
│   │       └── schemas.py       # Pydantic schemas
│   ├── requirements.txt
│   └── .env
├── frontend\
│   ├── src\
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components\
│   │   │   ├── ThreeBackground.tsx   # 3D animated bg
│   │   │   ├── Header.tsx
│   │   │   ├── DocumentInput.tsx
│   │   │   ├── AnalysisPanel.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ClauseCard.tsx
│   │   │   ├── HealthCard.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── HistoryPanel.tsx
│   │   │   ├── ProviderSelector.tsx
│   │   │   ├── ExportButtons.tsx
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── LanguageSelector.tsx
│   │   ├── hooks\
│   │   │   ├── useAnalysis.ts
│   │   │   ├── useChat.ts
│   │   │   ├── useHistory.ts
│   │   │   ├── useTheme.ts
│   │   │   └── useLanguage.ts
│   │   ├── services\
│   │   │   └── api.ts
│   │   ├── types\
│   │   │   └── index.ts
│   │   ├── utils\
│   │   │   ├── i18n.ts
│   │   │   └── exporters.ts
│   │   └── styles\
│   │       └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env.example
└── README.md
```

## API Design

### POST /api/analyze
Analyze a legal document.

Request:
```json
{
  "text": "string (optional)",
  "provider": "gemini|groq|ollama",
  "language": "en|hi|bn|mr|ta|ml",
  "model": "string (optional)"
}
```
Multipart for file uploads.

Response:
```json
{
  "id": "uuid",
  "health": {
    "rating": "Good|Standard|Caution",
    "justification": "string"
  },
  "severity": { "high": 2, "medium": 1, "low": 3 },
  "next_steps": ["string"],
  "summary": "string",
  "clauses": [
    {
      "title": "string",
      "severity": "High|Medium|Low",
      "explanation": "string"
    }
  ],
  "full_text": "string"
}
```

### POST /api/chat
Follow-up chat about a document.

Request:
```json
{
  "message": "string",
  "context": "string",
  "provider": "gemini|groq|ollama",
  "language": "en|hi|bn|mr|ta|ml"
}
```

Response (streaming):
```
data: {"chunk": "text..."}
data: {"done": true}
```

### GET /api/providers
List available providers and their models.

Response:
```json
{
  "providers": [
    {
      "id": "gemini",
      "name": "Google Gemini",
      "models": ["gemini-2.5-flash"],
      "available": true
    },
    {
      "id": "groq",
      "name": "Groq",
      "models": ["llama-3.3-70b", "mixtral-8x7b"],
      "available": true
    },
    {
      "id": "ollama",
      "name": "Ollama (Local)",
      "models": ["llama3.2", "mistral"],
      "available": true
    }
  ]
}
```

## 3D Visual Design

### Background
- Three.js particle system with 3000+ particles
- Particles form a subtle brain/neural network shape
- Colors: deep blue (#0d3d56), teal (#48a9a6), gold (#f2a104)
- Particles gently pulse and orbit
- Mouse interaction: particles react to cursor movement
- Dark/light mode: particle colors adapt

### UI Theme
- Glass-morphism panels with backdrop-blur
- Dark mode: slate-900 base with teal accents
- Light mode: white base with blue accents
- Animated entrance with staggered fade-in
- Smooth transitions between states

## Features (Enhanced over v1)

1. **Multi-Provider LLM**: Switch between Gemini, Groq, Ollama
2. **Provider Health Check**: Real-time availability status
3. **3D Animated Background**: Three.js neural network visualization
4. **Streaming Responses**: Real-time chat responses
5. **Clause Risk Radar**: Visual chart of clause severity
6. **Voice Input**: Web Speech API for voice queries
7. **Document Templates**: Common legal document templates
8. **Comparison Mode**: Compare two documents side-by-side
9. **Advanced Export**: PDF, Markdown, DOCX export
10. **Session History**: Server-side session history
11. **Model Selection**: Choose specific model per provider
12. **Confidence Score**: AI confidence indicator per analysis

## Color Palette

```
Primary: #0d3d56 (deep navy)
Secondary: #48a9a6 (teal)
Accent: #f2a104 (gold)
Success: #10b981 (green)
Warning: #f59e0b (amber)
Danger: #ef4444 (red)
```
