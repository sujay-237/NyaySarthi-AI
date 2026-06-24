from fastapi import APIRouter
import httpx

from app.models.schemas import ProvidersResponse, ProviderInfo
from app.config import get_settings

router = APIRouter()
settings = get_settings()


async def _check_gemini() -> bool:
    if not settings.GEMINI_API_KEY:
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
            )
            return resp.status_code == 200
    except Exception:
        return False


async def _check_groq() -> bool:
    if not settings.GROQ_API_KEY:
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"}
            )
            return resp.status_code == 200
    except Exception:
        return False


async def _check_ollama() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


@router.get("/providers", response_model=ProvidersResponse)
async def list_providers():
    gemini_available = await _check_gemini()
    groq_available = await _check_groq()
    ollama_available = await _check_ollama()

    return ProvidersResponse(providers=[
        ProviderInfo(
            id="gemini",
            name="Google Gemini",
            models=[settings.DEFAULT_GEMINI_MODEL],
            available=gemini_available
        ),
        ProviderInfo(
            id="groq",
            name="Groq",
            models=[settings.DEFAULT_GROQ_MODEL],
            available=groq_available
        ),
        ProviderInfo(
            id="ollama",
            name="Ollama (Local)",
            models=[settings.DEFAULT_OLLAMA_MODEL],
            available=ollama_available
        ),
    ])
