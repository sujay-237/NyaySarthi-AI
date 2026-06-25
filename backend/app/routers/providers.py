from fastapi import APIRouter
import httpx

from app.models.schemas import ProvidersResponse, ProviderInfo
from app.config import get_settings

router = APIRouter()
settings = get_settings()


async def _check_gemini() -> tuple[bool, list[str]]:
    if not settings.GEMINI_API_KEY:
        return False, []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={settings.GEMINI_API_KEY}"
            )
            if resp.status_code != 200:
                return False, []
            data = resp.json()
            models = [m["name"] for m in data.get("models", []) if "gemini" in m.get("name", "")]
            return True, models[:5] or [settings.DEFAULT_GEMINI_MODEL]
    except Exception:
        return False, [settings.DEFAULT_GEMINI_MODEL]


async def _check_groq() -> tuple[bool, list[str]]:
    if not settings.GROQ_API_KEY:
        return False, []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"}
            )
            if resp.status_code != 200:
                return False, []
            data = resp.json()
            models = [m["id"] for m in data.get("data", [])]
            return True, models[:5] or [settings.DEFAULT_GROQ_MODEL]
    except Exception:
        return False, [settings.DEFAULT_GROQ_MODEL]


async def _check_ollama() -> tuple[bool, list[str]]:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/tags")
            if resp.status_code != 200:
                return False, [settings.DEFAULT_OLLAMA_MODEL]
            data = resp.json()
            models = [m["name"] for m in data.get("models", [])]
            return True, models or [settings.DEFAULT_OLLAMA_MODEL]
    except Exception:
        return False, [settings.DEFAULT_OLLAMA_MODEL]


@router.get("/providers", response_model=ProvidersResponse)
async def list_providers():
    gemini_available, gemini_models = await _check_gemini()
    groq_available, groq_models = await _check_groq()
    ollama_available, ollama_models = await _check_ollama()

    return ProvidersResponse(providers=[
        ProviderInfo(
            id="gemini",
            name="Google Gemini",
            models=gemini_models,
            available=gemini_available
        ),
        ProviderInfo(
            id="groq",
            name="Groq",
            models=groq_models,
            available=groq_available
        ),
        ProviderInfo(
            id="ollama",
            name="Ollama (Local)",
            models=ollama_models,
            available=ollama_available
        ),
    ])
