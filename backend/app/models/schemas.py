from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class HealthRating(BaseModel):
    rating: str = Field(..., description="Good, Standard, or Caution")
    justification: str

class Clause(BaseModel):
    title: str
    severity: Literal["High", "Medium", "Low"]
    explanation: str

class SeverityCounts(BaseModel):
    high: int = 0
    medium: int = 0
    low: int = 0

class AnalysisRequest(BaseModel):
    text: str = ""
    provider: Literal["gemini", "groq", "ollama"] = "gemini"
    model: Optional[str] = None
    language: Literal["en", "hi", "bn", "mr", "ta", "ml"] = "en"

class AnalysisResponse(BaseModel):
    id: str
    health: HealthRating
    severity: SeverityCounts
    next_steps: List[str]
    summary: str
    clauses: List[Clause]
    full_text: str

class ChatMessage(BaseModel):
    message: str
    context: str
    provider: Literal["gemini", "groq", "ollama"] = "gemini"
    model: Optional[str] = None
    language: Literal["en", "hi", "bn", "mr", "ta", "ml"] = "en"

class ChatChunk(BaseModel):
    chunk: str = ""
    done: bool = False

class ProviderInfo(BaseModel):
    id: str
    name: str
    models: List[str]
    available: bool

class ProvidersResponse(BaseModel):
    providers: List[ProviderInfo]

class HistoryItem(BaseModel):
    id: str
    title: str
    date: datetime
    response: AnalysisResponse
